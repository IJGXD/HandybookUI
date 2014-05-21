var indexApp = angular.module('indexApp', []);

indexApp.controller('IndexCtrl', function($scope,$http) {
	$scope.bookings = [];

	//Messages to be shown on custom alerts
	$scope.successMessage = "";
	$scope.errorMessage = "";

	//Shows / hides the create booking class
	$scope.toggleCreate = function() {
		$("#showBookings").toggleClass("hidden");
		$("#newBooking").toggleClass("hidden");
		($("#createNewTerminalButton").text() == "Book now") ? $("#createNewTerminalButton").html("Done") : $("#createNewTerminalButton").html("Book now");
	};

	//Gets new bookings from server and replaces current ones
	$scope.updateBookings = function() {
		$http.post(window.location.origin+"/getBookings").success(function(data,status,headers,config) {
			if(data.responseCode == 1)
				$scope.bookings = data.bookings;
		}).
	    error(function(data, status, headers, config) {
	    	$scope.alertError("Network error");
	    });
	}
	//Fetches new bookings
	$scope.updateBookings();

	//Get new quote (to be shown on left panel while making a booking)
	$scope.updateQuote = function() {
		
		$http.post(window.location.origin+"/getPrice", {
			zip: $scope.newBookingZip,
		  	beds: $scope.newBookingBedrooms,
		  	baths: $scope.newBookingBathrooms 
		}).success(function(data, status, headers, config) {
			console.log("here = " + JSON.stringify(data));
			var response = data;
			if(response.responseCode == 1)
				$scope.currentQuote = response.price;
	    }).
	    error(function(data, status, headers, config) {
	    	$scope.alertError("Network error");
	    });
		
	};

	//Send new booking to server (to do - put in an array)
	$scope.submitBooking = function() {
		if($scope.newBookingForm.$invalid) {
			$scope.alertError("Please validate all fields before submitings");
		} else {
			$http.post(window.location.origin+"/book", {
				first_name:$scope.newBookingFirstName,
				last_name:$scope.newBookingLastName,
				email:$scope.newBookingEmail,
				phone:$scope.newBookingPhone,
				zipcode:$scope.newBookingZip,
				address_line_one:$scope.newBookingAddress1,
				address_line_two:$scope.newBookingAddress2,
				address_city:$scope.newBookingAddressCity,
				address_state:$scope.newBookingAddressState,
				beds: $scope.newBookingBedrooms,
				baths: $scope.newBookingBathrooms,
				time: $scope.newBookingTime
			}).success(function(data, status, headers, config) {
				var response = data;
				console.log(JSON.stringify(data));
				$scope.alertSuccess("Booking created succesfully!");
				$scope.updateBookings();
		    }).
		    error(function(data, status, headers, config) {
		    	$scope.alertError("Network error");
		    });
		}
	}

	//Add a comment to a booking
	$scope.addComment = function(row) {
		$http.post(window.location.origin+"/addComment", {
			id : row.id,
			comment : prompt("Please enter your comment", "")
		}).success(function(data, status, headers, config) {
			var response = data;
			if(response.responseCode == 1)
				$scope.alertSuccess("Comment added");
	    }).
	    error(function(data, status, headers, config) {
	    	$scope.alertError("Network error");
	    });
	}

	//Cancel a booking
	$scope.cancelBooking = function(row) {
		$http.post(window.location.origin+"/cancelBooking", {
			id : row.id
		}).success(function(data, status, headers, config) {
			var response = data;
			if(response.responseCode == 1) {
				$scope.updateBookings();
				$scope.alertSuccess("Booking canceled");
			}
	    }).
	    error(function(data, status, headers, config) {
	    	$scope.alertError("Network error");
	    });
	}

	//Show success alert
	$scope.alertSuccess = function(message) {
		$scope.successMessage = message;
		$("#alertSuccess").toggleClass("hidden");
		window.setTimeout(function() {
			$("#alertSuccess").toggleClass("hidden");
		}, 2000);

	}

	//Show error alert
	$scope.alertError = function(message) {
		$scope.errorMessage = message;
		$("#errorAlert").toggleClass("hidden");
		window.setTimeout(function() {
			$("#errorAlert").toggleClass("hidden");
		}, 2000);

	}

});