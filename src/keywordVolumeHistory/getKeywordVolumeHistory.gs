var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
	var AuthTypes = cc.AuthType;
    var osef=null;

    try {
        osef = cc
            .newAuthTypeResponse()
            .setAuthType(AuthTypes.USER_TOKEN)
            .build();
    } catch (error) {
        console.log(error);
        newUserError()
            .setDebugText('Error in getAuthType: ' + error)
            .setText('Oops! There was an error.')
            .throwException();
    }

	return osef;
}

function getConfig(request) {
    var config = cc.getConfig();
    try {
        config.newInfo()
            .setId('instructions')
            .setText('Enter keyword.');

        config.newTextInput()
            .setId('keyword')
            .setName('Enter a single keyword or expression')
            .setHelpText('e.g. "mutuelle" or "comment décoller du papier peint"')
            .setPlaceholder('mutuelle');

    } catch (error) {
        console.log(error);
        newDebugError()
            .setDebugText('Error in getConfig: ' + error)
            .setText('Oops! There was an error.')
            .throwException();
    }

	return config.build();
}

function isAdminUser() {
    return true;
}

function isAuthValid() {
    return true;
}

function getFields(request) {
	var cc = DataStudioApp.createCommunityConnector();
	var fields = cc.getFields();
	var types = cc.FieldType;
	var aggregations = cc.AggregationType;

    try {
        fields.newMetric()
            .setId('volume')
            .setType(types.NUMBER)
            .setAggregation(aggregations.SUM);

        fields.newDimension()
            .setId('date')
            .setType(types.YEAR_MONTH_DAY);

    } catch (error) {
        console.log(error);
        newDebugError()
            .setDebugText('Error in getFields: ' + error)
            .setText('Oops! There was an error.')
            .throwException();
    }
	return fields;
}

function getSchema(request) {
    try {
        var fields = getFields(request).build();
        return { schema: fields };
    } catch (error) {
        console.log(error);
        newDebugError()
            .setDebugText('Error in getSchema: ' + error)
            .setText('Oops! There was an error.')
            .throwException();
    }
	return null;
}

function responseToRows(requestedFields, response) {
    try {
        return Object.keys(response).map(function (key) {
            return {
                date: key,
                volume: resData[key]
            };
        });
    } catch (error) {
        console.log(error);
        newDebugError()
            .setDebugText('Error in responseToRows: ' + error)
            .setText('Oops! There was an error.')
            .throwException();
    }
    return null;
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

	var rows = responseToRows(requestedFields, resData, request.configParams.keyword);

	return {
		schema: requestedFields.build(),
		rows: rows
	};
}
