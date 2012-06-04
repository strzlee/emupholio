<?php

/** Emupholio
 * 	image.class.php
 * 	version 1.0
 *  last change: 23.04.2012
 * 
 * 
 *
 ** 
 *  (C) 2012, Straussn
 *	straussn.eu
 */

class Image {

	protected $imageDir;
	protected $thumbSuffix;
	
	public function __construct($_settings = array()) {
		$this->imageDir = $_settings["imageDir"];
		$this->thumbSuffix = $_settings["thumbSuffix"];
	}
	
	public function setDir($dir) {
		$this->imageDir = $dir;
	}
	
	public function getList() {
		$fileList = array();
		if ($handle = opendir($this->imageDir)) {
			while ($file = readdir($handle)) {
				if (!($file === ".") && !($file === "..") && !(strrpos($file, $this->thumbSuffix))) {
					list($width, $height) = getimagesize($this->imageDir.$file);
					list($thumb,$thumbsize) = $this->checkThumb($file);
					$fileList[] = array("file" => $this->imageDir.$file,"thumb" => $thumb,"thumbsize" => $thumbsize,"width" => $width, "height" => $height, "name" => $file);
				}
			}
			return $fileList;
		} else {
			return "Folder ".$this->imageDir." not exist";	
		}
	}
	
	public function readExif($file) {
		return exif_read_data($this->imageDir.$file);
	}
	
	public function crop($image, $x, $y, $w, $h, $targ_w, $targ_h) {
	
		$jpeg_quality = 90;
	
		$src = $this->imageDir.$image;
		$img_r = imagecreatefromjpeg($src);
		$dst_r = ImageCreateTrueColor($targ_w, $targ_h );
	
		imagecopyresampled($dst_r, $img_r, 0, 0, $x, $y, $targ_w, $targ_h, $w, $h);

		header('Content-type: image/jpeg');
		return imagejpeg($dst_r ,$this->imageDir.$this->bumpExtension($image).".thumb.jpg", $jpeg_quality);	
	}
	
	protected function bumpExtension($filename) {
		$ext = explode(".",$filename);
		return $ext[0];
	}
	
	protected function checkThumb($image) {
		$thumb = $this->imageDir.$this->bumpExtension($image).".thumb.jpg";
		if (file_exists($thumb)) {
			$size = getimagesize($thumb);
			return array($thumb, $size[0]);	
		} else return false;
	}
	
}



?>