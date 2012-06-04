<?php

/** Emupholio
 * 	upload.class.php
 * 	version 1.0
 *  last change: 23.04.2012
 * 
 * 
 *
 ** 
 *  (C) 2012, Straussn
 *	straussn.eu
 */

class Upload {

	protected $target_path;
	protected $allowed_ext;
	
	public function __construct($_settings= array()) {
		$this->target_path = $_settings["imageDir"];
		$this->allowed_ext = $_settings["allowedExt"];
	}
	
	public function start($file=array()) {
		$response = "";
		foreach($file["name"] as $key => $val) {
			if ($this->checkExtensions($val)) {			
					  if(move_uploaded_file($file["tmp_name"][$key], $this->target_path.basename($val))) {
						   $response .= "<p>".$val." upload ok</p>";
					  } else {
						   $response .= "<p>".$val." upload error</p>";
					  }
			 } else {
				 $response .= "<p>".$val." filetype not supported</p>";
			 }
		} 
		return $response; 
	}
	
	public function delete($file) {
		return unlink($file);
	}
	
	protected function checkExtensions($file) {
		$ext = explode(".",$file);
		$endung = strtolower(array_pop($ext));
		if (strpos($this->allowed_ext,$endung)) {
			return TRUE;
		} else {
			return FALSE;
		}
	}
	
	protected function randomstring() {
		return substr(md5 (uniqid (rand())),0,8);	
	}
	
}

?>