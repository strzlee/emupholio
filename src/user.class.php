<?php

/** Emupholio
 * 	user.class.php
 * 	version 1.0
 *  last change: 23.04.2012
 * 
 * 
 *
 ** 
 *  (C) 2012, Straussn
 *	straussn.eu
 */


class User {

	protected $user;
	protected $pass;
	
	public function __construct($_settings = array()) {
		$this->user = $_settings["user"];
		$this->pass = $_settings["pass"];
	}
	
	public function login($user,$pass) {
		if ($this->user == $user && $this->pass == $pass) {
			$_SESSION["user"] = $user;
			return $user;
		} else {
			return FALSE;
		}
	}
	
	public function logout() {
		if (isset ($_SESSION["user"])) {
			unset ($_SESSION["user"]);
			return TRUE;
		} else {
			return FALSE;
		}
	}
	
	public function check() {
		if (isset ($_SESSION["user"])) {
			return TRUE;
		} else {
			return FALSE;
		}  
	}
}

?>