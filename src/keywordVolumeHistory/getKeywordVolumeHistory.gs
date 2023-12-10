var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
	var AuthTypes = cc.AuthType;
	return cc
		.newAuthTypeResponse()
		.setAuthType(AuthTypes.USER_TOKEN)
		.build();
}

function getConfig(request) {
	var config = cc.getConfig();
	
	config.newInfo()
		.setId('instructions')
		.setText('Enter keyword.');
	
	config.newTextInput()
		.setId('keyword')
		.setName('Enter a single keyword or expression')
		.setHelpText('e.g. "mutuelle" or "comment décoller du papier peint"')
		.setPlaceholder('mutuelle');
	
	return config.build();
}

function getFields(request) {
	var cc = DataStudioApp.createCommunityConnector();
	var fields = cc.getFields();
	var types = cc.FieldType;
	var aggregations = cc.AggregationType;
	
	fields.newMetric()
		.setId('volume')
		.setType(types.NUMBER)
		.setAggregation(aggregations.SUM);
	
	fields.newDimension()
		.setId('date')
		.setType(types.YEAR_MONTH_DAY);
	
	return fields;
}

function getSchema(request) {
	var fields = getFields(request).build();
	return { schema: fields };
}

function responseToRows(requestedFields, response) {
	return parsedResponse = Object.keys(response).map(function (key) {
		return {
			date: key,
			volume: resData[key]
		};
	});
}

function getData(request) {
	var requestedFieldIds = request.fields.map(function(field) {
		return field.name;
	});
	var requestedFields = getFields().forIds(requestedFieldIds);

	// Fetch and parse data from API	
	var options = {
		'method': 'post',
		'contentType': 'application/json',
		'payload': JSON.stringify(request), // hopefully this contains the keyword
		headers: {
			'accept': 'application/json',
			'content-type': 'application/json',
			'haloscan-api-key': getAuthType.getApiKey()

		}
	};
	var response = UrlFetchApp.fetch('https://api.haloscan.com/api/keywords/overview/volumeHistory', options);
	var resData = JSON.parse(response).results;

	var rows = responseToRows(requestedFields, parsedResponse, request.configParams.package);

	return {
		schema: requestedFields.build(),
		rows: rows
	};
}
