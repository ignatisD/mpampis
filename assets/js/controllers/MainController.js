(function() {
	"use strict";
	angular
	.module("app")
	.controller("MainController", MainController);

	MainController.$inject = ["$scope", "$localStorage", "$q", "$timeout"];

	function MainController($scope, $localStorage, $q, $timeout) {


		const excel = require('node-excel-export');

		$scope.ajaxLoading = false;
		$scope.$storage = $localStorage;

		$scope.openExternal = function(url){
			shell.openExternal(url);
        };
        $scope.results = {
	        ajaxLoading: false,
            state: 0,
	        files: [],
			found: {},
	        filepath: "",
	        checkFile: function(path){
	            var parts = path.split(".");
				if (parts.length > 1 && (parts[parts.length - 1] === "jpg" || parts[parts.length - 1] === "jpeg")) {
					return parts[0];
				}
				return false;
	        },
	        reset: function(){
            	this.state = 0;
            	this.filepath = "";
	        },
			openFolder: async function () {
				const path = await dialog.showOpenDialog({
					properties: ['openDirectory']
				});
				if (path && !path.canceled) {
					$scope.$storage.env.directory = (path.filePaths || [])[0] || "";
				} else {
					$scope.$storage.env.directory = "";
				}
				$scope.$apply();
			},
	        analyzeFolder: function(){
            	const parent = this;
		        parent.ajaxLoading = true;
		        fs.readdir($scope.$storage.env.directory, function(err, files) {
			        parent.ajaxLoading = false;
			        // es6
			        if(err){
				        console.warn(err);
				        alert("Αποτυχία ανάγνωσης φακέλου.");
				        $scope.$apply();
				        return;
			        }
			        for(let filePath of files) {
						let filename = parent.checkFile(filePath);
			        	if(filename){
					        parent.files.push(filename);
				        }
			        }
			        parent.state = 1;
			        $scope.$apply();
		        });
	        },
	        clearFolder: function(){
		        this.reset();
		        this.files = [];
		        $scope.$storage.env.directory = '';
	        }
        };
		$scope.$watch("$storage.env.directory", function(dir){
			$scope.results.state = 0;
		});

		$scope.massFilter = {
			text: "",
			element   : null,
			clear: function () {
				this.text = "";
			},
			show: function () {
				this.element.modal("show");
			},
			applyFilters: function () {
				if (!this.text) {
					return;
				}
				$scope.results.found = {};
				this.text.replace(/([^\s]+)/g, function (matches, match) {
					$scope.results.found[match] = true;
				});
				$scope.results.files.sort((a, b) => {
					if ($scope.results.found[a] && $scope.results.found[b]) {
						return 0;
					}
					if (!$scope.results.found[a] && !$scope.results.found[b]) {
						return 0;
					}
					if ($scope.results.found[a]) {
						return -1;
					}
					if ($scope.results.found[b]) {
						return 1;
					}
				})
				this.element.modal("hide");
			},
			init      : function () {
				this.element = angular.element("#massFilterModal");
				this.element.on("hidden.bs.modal", () => {
					$scope.$applyAsync(() => {
						this.clear();
					})
				});
			},
		}
	}

})();
