<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Klarhed_Course {
    private static $data = null;

    public static function get_data() {
        if ( self::$data !== null ) return self::$data;
        $path = KLARHED_PATH . 'data/course.json';
        if ( ! file_exists( $path ) ) {
            error_log( 'KLARHED: course.json not found at ' . $path );
            self::$data = [ 'meta' => [], 'baseline' => [ 'groups' => [] ], 'chapters' => [] ];
            return self::$data;
        }
        $json = file_get_contents( $path );
        $decoded = json_decode( $json, true );
        if ( ! is_array( $decoded ) ) {
            error_log( 'KLARHED: course.json could not be parsed (json_last_error=' . json_last_error() . ')' );
            self::$data = [ 'meta' => [], 'baseline' => [ 'groups' => [] ], 'chapters' => [] ];
            return self::$data;
        }
        self::$data = $decoded;
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
