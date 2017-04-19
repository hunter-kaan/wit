<?php

/**
 * Created by Mne-Dom.com.
 * User: zero
 * Date: 10.04.2017
 * Time: 13:15
 */
class WitItem
{
	public $id;
	public $when;
	public $if;
	public $then;

	public $errors = [];

	public function __construct(array $data)
	{
		$this->id = isset($data['id']) && $data['id'] > 0 ? $data['id'] : null;
		$this->when = isset($data['when']) ? $data['when'] : null;
		$this->if = isset($data['if']) ? $data['if'] : null;
		$this->then = isset($data['then']) ? $data['then'] : null;
	}

	public function save()
	{
		if(!trim($this->when)) {
			$this->addError('When', 'Поле обязательно для заполнения.');
		}
		else if(mb_strlen($this->when) > 512) {
			$this->addError('When', 'Поле не может быть длинее 512 символов.');
		}

		if(!trim($this->if)) {
			$this->addError('If', 'Поле обязательно для заполнения.');
		}
		else if(mb_strlen($this->if) > 512) {
			$this->addError('If', 'Поле не может быть длинее 512 символов.');
		}

		if(!trim($this->then)) {
			$this->addError('Then', 'Поле обязательно для заполнения.');
		}
		else if(mb_strlen($this->then) > 512) {
			$this->addError('Then', 'Поле не может быть длинее 512 символов.');
		}

		if(!$this->hasError()) {
			if (is_null($this->id)) {
				// New record
				$this->id = ++$_SESSION['lastId'];
			}
			$_SESSION['wit'][$this->id] = $this;
		}

		return !$this->hasError();
	}

	public function delete()
	{
		if(isset($_SESSION['wit'][$this->id])) {
			unset($_SESSION['wit'][$this->id]);
			return true;
		}
		return false;
	}

	public function hasError()
	{
		return !empty($this->errors);
	}

	public function getErrors()
	{
		return $this->errors;
	}

	protected function addError($field, $message) {
		$this->errors[] = [
			'field' => $field,
			'message' => $message,
		];
	}
}