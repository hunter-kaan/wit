/**
 * Created by zero on 01.03.2017.
 */
$(function ($) {
	$('.dropdown-toggle').dropdown();

	$('body')
		.on('click', '.wit-item', function () {
			console.log('select/deselect WIT', $(this).data('wit'));
			$(this).toggleClass('selected');
			$('#wit-list').trigger('renew');
			return false;
		})
		.on('click', '#toggle-all-wit', function () {
			console.log('toggle all WIT');
			$('.wit-item').toggleClass('selected', witItems.items.length > witItems.selected);
			$('#wit-list').trigger('renew');
			return false;
		})
		.on('click', '#delete-selected-wit', function () {
			let selected = $('.wit-item').filter('.selected');

			let modal = $('<div id="page-modal" class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog">')
				.append($('<div class="modal-dialog modal-lg" role="document"></div>')
					.append($('<div class="modal-content"></div>')
						.append($('<div class="modal-header"></div>')
							.append('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
							.append($('<h4 class="modal-title"></h4>').text('Удаление элементов'))
						)
						.append($('<div class="modal-body"></div>').html('Подтвердите удаление элементов'))
						.append($('<div class="modal-footer"></div>')
							.append('<button type="button" class="btn btn-default cancel" data-dismiss="modal">Отмена</button>')
							.append('<button type="button" class="btn btn-primary delete">Удалить (' + selected.length + ')</button>')
						)
					)
				).appendTo('body');

			modal
				.on('click', 'button.delete', function () {
					selected.each(function () {
						let wit = $(this).data('wit'),
							that = this;
						console.log('WIT deleted', wit);
						witItems.removeItem(wit).done(function() {
							let alert = $('<div class="alert alert-success alert-dismissible wit-deleted" role="alert"></div>')
								.append('<strong>Элемент был удален.</strong>').replaceAll(that);
							$('#wit-list').trigger('renew');
						}).fail(function(e) {
							$('<div class="alert alert-danger alert-dismissible delete-error" role="alert"></div>')
								.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
								.append('<strong>' + e['error'] + '</strong>').insertBefore(that);
							$('#wit-list').trigger('renew');
						});
					});

					modal.modal('hide');


					// deferred.done(function () {
					// 	let alert = $('<div class="alert alert-success alert-dismissible wit-deleted" role="alert"></div>')
					// 	// .append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
					// 		.append('<strong>Элемент был удален.</strong>').replaceAll(selected);
					// });
					return false;
				})
				.on('click', 'button.cancel', function () {
					console.log('Cancel deleting WIT');
				})
				.on('hidden.bs.modal', function () {
					$(this).remove();
				});

			modal.modal('show');

			return false;
		})
		.on('click', '.wit-deleted', function () {
			$(this).slideUp(500, function () {
				$(this).remove();
			});
			return false;
		})
		.on('renew.valiant', '#wit-list', function () {
			witItems.selected = $('.wit-item.selected').length;
			$('#delete-selected-wit').toggleClass('hidden', witItems.selected === 0);
			$(this).find('.summary .total-items').text(witItems.items.length).end()
				.find('#toggle-all-wit').text(witItems.items.length === 0 || witItems.items.length > witItems.selected ? 'Выделить все' : 'Снять выделение');
		})
		.on('submit', '#wit-form', function () {
			let whenInput = $('#whenInput'),
				ifInput = $('#ifInput'),
				thenInput = $('#thenInput'),
				errorContainer = $(this).find('.errors').empty(),
				that = $(this);

			that.find('[data-field]')
				.removeClass('has-success')
				.removeClass('has-error');


			console.log('submit');
			let newItem = new WitItem(null, whenInput.val(), ifInput.val(), thenInput.val());

			newItem.validateAndSave()
				.done(function (data) {
					newItem.id = data['wit']['id'];
					witItems.addItem(newItem);

					whenInput.val('');
					ifInput.val('');
					thenInput.val('');

					console.log('New WIT append.', newItem);
					$('#modal-new-wit').modal('hide');
				})
				.fail(function () {
					console.log('New WIT has errors', newItem.getErrors());

					let alert = $('<div class="alert alert-danger alert-dismissible" role="alert"></div>')
						.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>')

					that.find('[data-field]').addClass('has-success');

					$.each(newItem.getErrors(), function () {
						this.render().appendTo(alert);
						that.find('[data-field="' + this.field.toLowerCase() + '"]')
							.removeClass('has-success')
							.addClass('has-error');
					});

					errorContainer.append(alert);
				});

			return false;
		})
		.on('change', '#wit-form textarea', function () {
			console.log(this);
			$(this).closest('.form-group').removeClass('has-success has-error');
		})
		.on('click', '[data-load-url]', function () {
			$('[data-load-url]').attr('disabled', 'disabled');

			$.ajax({
				url: $(this).data('load-url'),
				type: 'GET',
			}).done(function (data) {
				data = $('<div>').html(data);

				let title = data.find('title').text(),
					body = data.find('#content').html();

				let modal = $('<div id="page-modal" class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog">')
					.append($('<div class="modal-dialog modal-lg" role="document"></div>')
						.append($('<div class="modal-content"></div>')
							.append($('<div class="modal-header"></div>')
								.append('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>')
								.append($('<h4 class="modal-title"></h4>').text(title))
							)
							.append($('<div class="modal-body"></div>').html(body))
						)
					).appendTo('body');

				console.log('Page modal created');

				modal.on('hidden.bs.modal', function () {
					console.log('Page modal removed');
					$(this).remove();
				});

				modal.modal('show');

			}).always(function () {
				$('[data-load-url]').removeAttr('disabled');
			})
		})
	;


	let witItems = new WitItems();
});


class Entity {
	validate() {
		this.errors = [];
	}

	addError(field, error) {
		this.errors[this.errors.length] = new EntityError(field, error);
	}

	getErrors() {
		return this.errors;
	}

	hasError() {
		return this.errors.length > 0;
	}
}

class WitItem extends Entity {
	constructor(id, witWhen, witIf, witThen) {
		super();

		this.id = id;
		this.witWhen = witWhen;
		this.witIf = witIf;
		this.witThen = witThen;
	}

	render() {
		let container = $('<div class="list-group-item wit-item row"></div>');
		container.data('wit', this);

		$('<div class="col-xs-1 checker"></div>')
			.appendTo(container)
			.after($('<div class="col-xs-2 wit-id" data-propery-name="id"></div>').text(this.id));

		$('<div class="col-xs-3 wit-value" data-propery-name="when"></div>').text(this.witWhen).appendTo(container);
		$('<div class="col-xs-3 wit-value" data-propery-name="if"></div>').text(this.witIf).appendTo(container);
		$('<div class="col-xs-3 wit-value" data-propery-name="then"></div>').text(this.witThen).appendTo(container);

		container.hover(function () {
			$(this).fadeTo(100, 1);
		}, function () {
			$(this).fadeTo(200, 0.7);
		});
		return container;
	}

	validateAndSave() {
		super.validate();

		let deferred = $.Deferred(),
			that = this;

		setTimeout(function () {
			if (!that.witWhen.trim()) {
				that.addError('When', 'Поле обязательно для заполнения.');
			}
			else if (that.witWhen.length > 512) {
				that.addError('When', 'Поле не может быть длинее 512 символов.');
			}

			if (!that.witIf.trim()) {
				that.addError('If', 'Поле обязательно для заполнения.');
			}
			else if (that.witIf.length > 512) {
				that.addError('If', 'Поле не может быть длинее 512 символов.');
			}

			if (!that.witThen.trim()) {
				that.addError('Then', 'Поле обязательно для заполнения.');
			}
			else if (that.witThen.length > 512) {
				that.addError('Then', 'Поле не может быть длинее 512 символов.');
			}

			if (that.hasError()) {
				deferred.reject();
			}
			else {
				that.save()
					.done(function (data) {
						if (data['result'] == 'OK') {
							deferred.resolve(data);
						}
						else {
							$.each(data.errors || {}, function () {
								that.addError(this.field, this.message)
							});
							deferred.reject();
						}
					})
					.fail(function () {
						that.addError('HTTP', 'Unexpected server error');
						deferred.reject();
					})
			}
		}, 1);


		return deferred.promise();
	}

	save() {
		return $.ajax({
			url: 'wit.php',
			type: 'POST',
			data: {
				action: 'create',
				wit: {
					'id': this.id,
					'when': this.witWhen,
					'if': this.witIf,
					'then': this.witThen
				}
			},
			dataType: 'json'
		}).done(function (data) {
			console.log('End save request', data);
		});
	}

	deleteItem() {
		return $.ajax({
			url: 'wit.php',
			type: 'POST',
			data: {
				action: 'delete',
				wit: {
					'id': this.id,
					'when': this.witWhen,
					'if': this.witIf,
					'then': this.witThen
				}
			},
			dataType: 'json'
		}).done(function (data) {
			console.log('End delete request', data);
		});
	}

	set id(id) {
		this.witId = id;
	}

	get id() {
		return this.witId ? this.witId : 'unsaved';
	}
}

class EntityError {
	constructor(field, error) {
		this.field = field;
		this.error = error;
	}

	render() {
		return $('<div></div>').append($('<strong>').text(this.field))
			.append(': ')
			.append(this.error);
	}
}

class WitItems {
	constructor() {
		this.container = $('#wit-list');

		let that = this;

		this.items = [];
		this.selected = 0;

		$.ajax({
			url: 'wit.php',
			type: 'POST',
			data: {action: 'list'},
			dataType: 'json'
		}).done(function (data) {
			$.each(data, function () {
				let item = new WitItem(this['id'], this['when'], this['if'], this['then']);
				that.addItem(item);
			});
		});
	}

	addItem(item) {
		this.items.push(item);

		this.container.find('.list-group').prepend(item.render().hide().fadeTo(1000, 0.7));
		this.container.trigger('renew');
	}

	removeItem(item) {
		let deferred = $.Deferred(),
			that = this;

		item.deleteItem().done(function(data) {
			if(data['result'] === 'OK') {
				that.items.splice(that.items.indexOf(item), 1);
				deferred.resolve();
			}
			else {
				deferred.reject(data);
			}
		});

		return deferred;
	}
}