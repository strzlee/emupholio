<?php

/** Emupholio Bootstrap File
 * 	controller.php
 * 	version 0.9
 *  last change: 23.04.2012
 * 
 * 
 *
 ** 
 *  (C) 2012, Straussn
 *	straussn.eu
 */


require_once("./src/settings.php");

function __autoload($class) {
	include "./src/".strtolower($class).".class.php";
}

if(!isset($_SESSION)) {
	session_start(); 
}

header("Content-type: text/javascript; charset=UTF-8");

if (isset($_SESSION["user"])) {
	
	switch ($_GET["action"]) {
	
		case "getList":
			$image = new Image($emupholioSettings);	
			echo json_encode($image->getList());
			break;
			
		case "crop":
			$image = new Image($emupholioSettings);
			echo $image->crop($_GET["name"], $_GET["x"], $_GET["y"], $_GET["w"], $_GET["h"], $_GET["targ_w"], $_GET["targ_h"]);
			break;
			
		case "upload":
			$upload = new Upload($emupholioSettings);
			header("Content-type: text/html; charset= UTF-8");
			echo $upload->start($_FILES["uploads"]); 
			break;
			
		case "delete":
			$upload = new Upload($emupholioSettings);
			echo $upload->delete($_GET["file"]);
			break;
			
		case "userCheck":
			$user = new User($emupholioSettings);
			echo json_encode($user->check());
			break;	
			
		case "logout";
			$user = new User($emupholioSettings);
			echo json_encode($user->logout());
			break;	
		
		case "admin":
			header("location: backend.html");
			break;
			
		case "readExif":
			$image = new Image($emupholioSettings);	
			echo json_encode($image->readExif($_GET["file"]));
			break;
			
		default: 
			header("location: index.html");
			break;
	}
	
} else {
	
	switch($_GET["action"]) {
		
		case "getList":
			$image = new Image($emupholioSettings);	
			echo json_encode($image->getList());
			break;
			
		case "readExif":
			$image = new Image($emupholioSettings);	
			echo json_encode($image->readExif($_GET["file"]));
			break;
	
		case "userCheck":
			$user = new User($emupholioSettings);
			echo json_encode($user->check());
			break;	
			
		case "login":
			$user = new User($emupholioSettings);
			$user->login($_POST["user"], $_POST["pass"]);
			header("location: backend.html");
			break;
			
		case "admin":
			header("location: backend.html");
			break;
			
		default: 
			header("location: index.html");
			break;
	}
}






?>