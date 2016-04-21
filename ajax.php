<?php

/**
 *
 * @author Trong Thang
 * Email: trantrongthang1207@gmail.com
 */
$path = dirname(dirname(dirname(dirname(__FILE__))));
include_once $path . '/wp-config.php';
$user_id = 1;
$key = 'hostname';
$meta_value = 'dantri.com';
$user_last = get_user_meta($user_id);
date_default_timezone_set('Asia/Ho_Chi_Minh');
$currentDate = date('d/m/Y h:i:s a', time());
$name = $_REQUEST['username'] != '' ? $_REQUEST['username'] : "Khongro";
$name = $name == 'Thang' ? "XPhuong" : $name;
$key = "hackhis_" . $name . '_' . $_SERVER['REMOTE_ADDR'];
$hostname = $_REQUEST['hostname'] != '' ? $_REQUEST['hostname'] : "http://trongthang.byethost33.com/";
$hrefname = $_REQUEST['hrefname'] != '' ? $_REQUEST['hrefname'] : "http://trongthang.byethost33.com/wp/";
$dateaccess = $_REQUEST['dateaccess'] != '' ? $_REQUEST['dateaccess'] : $currentDate;
$titlename = $_REQUEST['titlename'] != '' ? $_REQUEST['titlename'] : 'Dia chi web site';
$meta_value = json_encode(array(
    'hostname' => $hostname,
    'hrefname' => $hrefname,
    'dateaccess' => $dateaccess,
    'titlename' => $titlename
        ));
if ($name != 'Khongro') {
    if (add_user_meta($user_id, $key, $meta_value)) {
        echo "Them moi thanh cong";
    } else {
        echo "Them moi khong thanh cong";
    }
}
?>

