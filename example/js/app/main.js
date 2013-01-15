require.config({
	 baseURL : 'js/app'
	,paths: { 
		 jquery: 'libs/jquery'
		,maps: 'components/maps'
	}
	,shim: {
		maps: ['jquery']
	}
});

require(['jquery', 'maps'], function($){
	
});
