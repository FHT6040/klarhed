<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Klarhed_Course {
    private static $data = null;

    public static function get_data() {
        if ( self::$data !== null ) return self::$data;

        // Primary: PHP file in includes/ (always deployed via FTP)
        $php_path = KLARHED_PATH . 'includes/course-data.php';
        if ( file_exists( $php_path ) ) {
            $decoded = include $php_path;
            if ( is_array( $decoded ) && ! empty( $decoded['chapters'] ) ) {
                self::$data = $decoded;
                return self::$data;
            }
        }

        // Fallback: data/course.json
        $json_path = KLARHED_PATH . 'data/course.json';
        if ( file_exists( $json_path ) ) {
            $decoded = json_decode( file_get_contents( $json_path ), true );
            if ( is_array( $decoded ) ) {
                self::$data = $decoded;
                return self::$data;
            }
        }

        error_log( 'KLARHED: could not load course data from includes/course-data.php or data/course.json' );
        self::$data = [ 'meta' => [], 'baseline' => [ 'groups' => [] ], 'chapters' => [] ];
        return self::$data;
    }

    public static function get_chapter( $slug ) {
        $data = self::get_data();
        foreach ( $data['chapters'] as $c ) {
            if ( $c['slug'] === $slug ) return $c;
        }
        return null;
    }

    public static function total_lessons() {
        $data = self::get_data();
        $n = 0;
        foreach ( $data['chapters'] as $c ) { $n += count( $c['lessons'] ); }
        return $n;
    }
}
