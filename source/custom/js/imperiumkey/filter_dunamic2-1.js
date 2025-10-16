$(document).ready(function() {
	var $startFilterPrice = startFilterPrice();

	var params = {
		sort: 'position',
		sortMode: 'asc', // descendant
		q: '',
		perpage: 16,
		page: 1,
		minPrice: 0,
		maxPrice: $startFilterPrice,
		minSteamPrice: 0,
		maxSteamPrice: 99999,
		type: [],
		other: ['stock']
	};


	// $("[name='q']").keyup(function(e) {
	// 	var $this = $(this),
	// 	q = $this.val();
	// 	params.q = $(this).val();
	// });


	var $productPaginator = $('#fn_product_paginator');
	var $mainFilter = $('#fn_filter');
	if($mainFilter.length)
	{
		$('#fn_filter_setprice_max').val($startFilterPrice);
		$('#fn_filter_setsteamprice_max').val(params.maxSteamPrice);

		$('.fn_filter_sort').change(function () {
			var $this = $(this);
			var $value = $this.val().split('-');
			params.sort = $value[0];
			params.sortMode = $value[1];
			getdata(params);
		});
	}


	$(document).on('change', '#fn_filter', function() {
		params.minPrice = $mainFilter.find('[name="minPrice"]').val();
		params.maxPrice = $mainFilter.find('[name="maxPrice"]').val();

		params.minSteamPrice = $mainFilter.find('[name="minSteamPrice"]').val();
		params.maxSteamPrice = $mainFilter.find('[name="maxSteamPrice"]').val();

		getdata(params);

		$('body').removeClass('dropshow--filter');

		return false;
	});


	$(document).on('change', '.fn_filter_checkbox', function() {
		var $this = $(this);
		var ex = $this.attr('id').split('-');
		params.page = 1;
		if ($this.prop("checked")) {
			params[ex[0]].push(ex[1]);
		} else {
			params[ex[0]].splice($.inArray(ex[1], params[ex[0]]), 1);
		}
		getdata(params, true);
		return false;
	});



	var getdata = function(params,empty) {

		var $searchProp = params;

		var $itemsWrap = $('#js-filter-catalog');
		var $items = $itemsWrap.find(".product__item-col");

		var $minPrice = parseFloat($searchProp['minPrice']);
		var $maxPrice = parseFloat($searchProp['maxPrice']);

		if(!$minPrice) $minPrice = 0;

		var $minSteamPrice = parseFloat($searchProp['minSteamPrice']);
		var $maxSteamPrice = parseFloat($searchProp['maxSteamPrice']);

		if(!$minSteamPrice) $minSteamPrice = 0;


		var $selectSort = $searchProp['sort'] + '_' + ($searchProp['sortMode'] === 'descendant' ? 'desc' : 'asc');
		var $itemsSortings;
		switch ($selectSort)
		{
			case 'name_asc':
			case 'name_desc':
				$itemsSortings = $items.sort(function (a, b) {
					var contentA = $(a).find('.product__item-title').text();
					var contentB = $(b).find('.product__item-title').text();
					if($searchProp['sortMode'] === 'descendant')
					{
						return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
					}
					return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
				});
				$itemsWrap.html($itemsSortings);
				break;

			default:
				$itemsSortings = $items.sort(function (a, b) {
					var contentA =parseInt( $(a).data('prop-' + $searchProp['sort']));
					var contentB =parseInt( $(b).data('prop-' + $searchProp['sort']));
					if($searchProp['sortMode'] === 'descendant')
					{
						return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
					}
					return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
				});
				$itemsWrap.html($itemsSortings);
				break;
		}


		var $infoNoFound = $('<div/>').addClass('items-nofound').text('Нечего не найдено. Измените параметры фильтра.');

		var $itemsSetHiddenCounter = 0;
		var $itemsIndex = 0;
		var $itemFilter = $items.hide().filter(function()
		{
			var $this = $(this);
			var $price = parseFloat($this.data("prop-price"), 10);
			if(!($price >= $minPrice && $price <= $maxPrice))
			{
				return false;
			}

			var $priceSteam = parseFloat($this.data("prop-steam-price"), 10);
			if(!($priceSteam >= $minSteamPrice && $priceSteam <= $maxSteamPrice))
			{
				return false;
			}

			if($searchProp['q'] && !($this.find('[data-product-title]').text().toLowerCase().indexOf($searchProp['q'].toLowerCase()) >= 0))
			{
				return false;
			}


			var $propAviable = 0;
			var $propListed = {};
			$.each($searchProp, function($indx, $value){
				if(
					$indx === 'sort'
					|| $indx === 'sortMode'
					|| $indx === 'q'
					|| $indx === 'page'
					|| $indx === 'minPrice'
					|| $indx === 'maxPrice'
				) {
					return;
				}

				if(!$value.length) return;

				var $propValue = $value;
				if(!$.isArray($value))
				{
					$propValue = [$value];
				}

				$indx = $indx.replace('[]', '');
				var $prop = $this.data("prop-" + $indx);
				var $propSplit = false;
				if($prop)
				{
					$propSplit = $prop.split('|');

					if(compareArray($propSplit, $propValue))
					{
						$propListed[$indx] = 'yes';
						$propAviable++;
						return true;
					}
					else
					{
						$propListed[$indx] = 'none';
					}
				}

			});

			if($searchProp['type'].length ||
				$searchProp['other'].length)
			{
				if($propListed['type'] === 'none')
				{
					return false;
				}
				if($propListed['other'] === 'none')
				{
					return false;
				}

				if($propListed['type'] === 'yes' ||
					$propListed['other'] === 'yes')
				{
					$itemsIndex++;
					if((params.perpage * params.page) < $itemsIndex)
					{
						$itemsSetHiddenCounter++;
						return false;
					}
					return true;
				};
			}
			else
			{
				$itemsIndex++;
				if((params.perpage * params.page) < $itemsIndex)
				{
					$itemsSetHiddenCounter++;
					return false;
				}
				return true;
			}
		});
		$itemFilter.show();


		var $getProductsCount = $items.filter(':visible').length;

		if($itemsSetHiddenCounter)
		{
			$('#fn_product_loadpage').attr('data-loadpage', 'enable');
		}
		else
		{
			$('#fn_product_loadpage').attr('data-loadpage', 'disable');
		}

		$('.fn_products_founds').html($getProductsCount + $itemsSetHiddenCounter);

		if(!$getProductsCount)
		{
			if(!$itemsWrap.find('.items-nofound').length)
			{
				$infoNoFound.prependTo($itemsWrap);
			}
		}
		else
		{
			$itemsWrap.find('.items-nofound').remove();
		}
	}

	getdata(params);



	/* START FILTER */
	function compareArray($array1, $array2)
	{
		var $isCompare = false;
		$.each($array1, function($indx, $value){
			if(!$isCompare)
			{
				var $isProp = $.inArray( $value, $array2 );
				if($isProp >= 0)
				{
					$isCompare = true;
				};
			}
		});
		return $isCompare;
	}


	function startFilterPrice()
	{
		var $prices = [];
		var $maxPrice = false;
		var $itemsWrap = $('#js-filter-catalog');
		var $items = $itemsWrap.find("[data-prop-price]");
		if($items.length)
		{
			var $posIndx = 1000;
			$items.each(function(){
				var $this = $(this);
				var $price = $this.attr("data-prop-price");
				$prices.push($price);

				$this.attr({'data-prop-position' : $posIndx});
				$posIndx++;
			});
			$prices.sort(function(a, b) {
				return a - b;
			});
			$maxPrice = $prices.pop();
		}
		if(!$maxPrice) $maxPrice = 5000;
		return Number($maxPrice);
	}

	/* Scroll loaded */
	if($productPaginator.length)
	{
		$productPaginator.click(function () {
			params.page++;
			getdata(params);
		});
	}
	/* END Scroll loaded */
});

/* END */