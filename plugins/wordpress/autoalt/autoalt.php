<?php
/**
 * Plugin Name: AutoAlt
 * Description: Automatically generates alt text for image uploads that do not already have alt text.
 * Version: 0.1.0
 * Author: AutoAlt
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit;
}

final class AutoAlt_Plugin
{
    private const OPTION_NAME = 'autoalt_options';
    private const DEFAULT_MODEL = 'gpt-5-mini';
    private const MAX_BYTES = 20000000;

    public static function init(): void
    {
        add_action('admin_menu', [self::class, 'add_settings_page']);
        add_action('admin_init', [self::class, 'register_settings']);
        add_filter('wp_generate_attachment_metadata', [self::class, 'maybe_generate_attachment_alt'], 10, 2);
    }

    public static function add_settings_page(): void
    {
        add_options_page(
            'AutoAlt',
            'AutoAlt',
            'manage_options',
            'autoalt',
            [self::class, 'render_settings_page']
        );
    }

    public static function register_settings(): void
    {
        register_setting('autoalt_settings', self::OPTION_NAME, [
            'sanitize_callback' => [self::class, 'sanitize_options'],
            'default' => [
                'enabled' => '1',
                'api_key' => '',
                'model' => self::DEFAULT_MODEL,
            ],
        ]);

        add_settings_section(
            'autoalt_main',
            'Generation',
            '__return_false',
            'autoalt'
        );

        add_settings_field(
            'enabled',
            'Generate alt text on upload',
            [self::class, 'render_enabled_field'],
            'autoalt',
            'autoalt_main'
        );

        add_settings_field(
            'api_key',
            'OpenAI API key',
            [self::class, 'render_api_key_field'],
            'autoalt',
            'autoalt_main'
        );

        add_settings_field(
            'model',
            'Model',
            [self::class, 'render_model_field'],
            'autoalt',
            'autoalt_main'
        );
    }

    public static function sanitize_options(array $input): array
    {
        return [
            'enabled' => empty($input['enabled']) ? '0' : '1',
            'api_key' => sanitize_text_field($input['api_key'] ?? ''),
            'model' => sanitize_text_field($input['model'] ?? self::DEFAULT_MODEL),
        ];
    }

    public static function render_settings_page(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }

        echo '<div class="wrap">';
        echo '<h1>AutoAlt</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields('autoalt_settings');
        do_settings_sections('autoalt');
        submit_button();
        echo '</form>';
        echo '</div>';
    }

    public static function render_enabled_field(): void
    {
        $options = self::get_options();
        printf(
            '<label><input type="checkbox" name="%1$s[enabled]" value="1" %2$s> Generate alt text when an uploaded image has no alt text.</label>',
            esc_attr(self::OPTION_NAME),
            checked($options['enabled'], '1', false)
        );
    }

    public static function render_api_key_field(): void
    {
        $options = self::get_options();
        printf(
            '<input type="password" class="regular-text" name="%1$s[api_key]" value="%2$s" autocomplete="off">',
            esc_attr(self::OPTION_NAME),
            esc_attr($options['api_key'])
        );
    }

    public static function render_model_field(): void
    {
        $options = self::get_options();
        printf(
            '<input type="text" class="regular-text" name="%1$s[model]" value="%2$s">',
            esc_attr(self::OPTION_NAME),
            esc_attr($options['model'])
        );
    }

    public static function maybe_generate_attachment_alt(array $metadata, int $attachment_id): array
    {
        $options = self::get_options();

        if ($options['enabled'] !== '1' || empty($options['api_key'])) {
            return $metadata;
        }

        if (wp_attachment_is_image($attachment_id) === false) {
            return $metadata;
        }

        $existing_alt = trim((string) get_post_meta($attachment_id, '_wp_attachment_image_alt', true));
        if ($existing_alt !== '') {
            return $metadata;
        }

        $file = get_attached_file($attachment_id);
        if (!$file || !is_readable($file) || filesize($file) > self::MAX_BYTES) {
            return $metadata;
        }

        $mime = wp_get_image_mime($file);
        if (!$mime || strpos($mime, 'image/') !== 0) {
            return $metadata;
        }

        $image_data = file_get_contents($file);
        if ($image_data === false) {
            return $metadata;
        }

        $alt_text = self::generate_alt_text(
            'data:' . $mime . ';base64,' . base64_encode($image_data),
            $options
        );

        if ($alt_text !== '') {
            update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt_text);
        }

        return $metadata;
    }

    private static function generate_alt_text(string $image_data_url, array $options): string
    {
        $body = [
            'model' => $options['model'] ?: self::DEFAULT_MODEL,
            'input' => [
                [
                    'role' => 'user',
                    'content' => [
                        [
                            'type' => 'input_text',
                            'text' => 'Write useful alt text for this image. Be specific, objective, concise, and include important visible text. Return only the alt text, 160 characters or fewer.',
                        ],
                        [
                            'type' => 'input_image',
                            'image_url' => $image_data_url,
                            'detail' => 'auto',
                        ],
                    ],
                ],
            ],
            'max_output_tokens' => 80,
        ];

        $response = wp_remote_post('https://api.openai.com/v1/responses', [
            'timeout' => 60,
            'headers' => [
                'Authorization' => 'Bearer ' . $options['api_key'],
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode($body),
        ]);

        if (is_wp_error($response)) {
            error_log('AutoAlt request failed: ' . $response->get_error_message());
            return '';
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        $payload = json_decode((string) wp_remote_retrieve_body($response), true);

        if ($status < 200 || $status >= 300) {
            $message = $payload['error']['message'] ?? ('HTTP ' . $status);
            error_log('AutoAlt generation failed: ' . $message);
            return '';
        }

        $text = self::extract_response_text($payload);
        $text = trim($text, " \t\n\r\0\x0B\"'");

        return function_exists('mb_substr') ? mb_substr($text, 0, 280) : substr($text, 0, 280);
    }

    private static function extract_response_text(array $payload): string
    {
        if (isset($payload['output_text']) && is_string($payload['output_text'])) {
            return $payload['output_text'];
        }

        $chunks = [];
        foreach ($payload['output'] ?? [] as $item) {
            foreach ($item['content'] ?? [] as $content) {
                if (isset($content['text']) && is_string($content['text'])) {
                    $chunks[] = $content['text'];
                }
            }
        }

        return implode(' ', $chunks);
    }

    private static function get_options(): array
    {
        $options = get_option(self::OPTION_NAME, []);

        return wp_parse_args($options, [
            'enabled' => '1',
            'api_key' => '',
            'model' => self::DEFAULT_MODEL,
        ]);
    }
}

AutoAlt_Plugin::init();
