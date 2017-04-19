<?php
/**
 * Created by Mne-Dom.com.
 * User: zero
 * Date: 10.04.2017
 * Time: 13:09
 */

session_start();

include_once('classes/WitItem.php');

$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

if($isAjax && empty($_POST)) {
	parse_str(file_get_contents('php://input'), $_POST);
}
$data = $isAjax ? $_POST : $_GET;

if(!isset($data['action'])) {
	throw new Exception('Incorrect request', 400);
}

if(!isset($_SESSION['lastId'])) {
	$_SESSION['lastId'] = 0;
}
if(!isset($_SESSION['wit'])) {
	$_SESSION['wit'] = [];
}

switch ($data['action']) {
	case 'list':
		if($_SESSION['lastId'] < 1) {
			// Init default WIT
			$items = getDefaultWit();
			foreach ($items as $item) {
				$item->save();
			}
		}

		echo json_encode($_SESSION['wit']);
		break;
	case 'create':
		$item = new WitItem(isset($data['wit']) ? $data['wit'] : []);
		if($item->save()) {
			echo json_encode([
				'result' => 'OK',
				'wit' => $item,
			]);
		}
		else {
			echo json_encode([
				'result' => 'ERROR',
				'errors' => $item->getErrors(),
			]);
		}
		break;
	case 'delete':
		$item = new WitItem(isset($data['wit']) ? $data['wit'] : []);
		if($item->delete()) {
			echo json_encode([
				'result' => 'OK'
			]);
		}
		else {
			echo json_encode([
				'result' => 'ERROR',
				'error' => 'Возникла ошибка при удалении WIT',
			]);
		}
		break;
}

/**
 * @return WitItem[]
 */
function getDefaultWit() {
	return [
		new WitItem([
			'when' => 'Происходит событие `click` по WIT',
			'if' => 'Элемент WIT в списке не выделен',
			'then' => 'Добавить класс `selected` к элементу',
		]),
		new WitItem([
			'when' => 'Происходит событие `click` по WIT',
			'if' => 'Элемент WIT в списке выделен',
			'then' => 'Удалить класс `selected` у элемента',
		]),
		new WitItem([
			'when' => 'Происходит событие `click` по кнопке "Выделить все/Снять выделение"',
			'if' => 'В списке есть не выделенные элементы WIT',
			'then' => 'Добавить класс `selected` ко всем элементам в списке и изменить надпись кнопки на "Снять выделение"',
		]),
		new WitItem([
			'when' => 'Происходит событие `click` по кнопке "Выделить все/Снять выделение"',
			'if' => 'В списке все элементы выделены',
			'then' => 'Удалить класс `selected` у всех элементов в списке и изменить надпись кнопки на "Выделить все"',
		]),
		new WitItem([
			'when' => 'Выделяется элемент в списке',
			'if' => 'Кнопка "Удалить выделенное" скрыта',
			'then' => 'Отобразить кнопку "Удалить выделенное"',
		]),
	];
}

