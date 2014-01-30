'use strict';

angular.module('HybridApp')
    .controller('HomeCtrl', function(Restangular, $scope, $rootScope, $location, localStorageService, Taskservice, Teamservice, Messageservice) {

        var id = localStorageService.get('user')._id;
        $scope.user = localStorageService.get('user');

        $scope.$emit('navbar', {
            'title': null,
            'buttons': {
                'move': true,
                'refresh': true,
                'newMsg': true
            }
        });

        function setTitle() {
            $scope.$emit('title', {
                'title': $scope.user.first_name + ' ' + $scope.user.surname
            });
        }

        function removeTitle() {
            $scope.$emit('title', {
                'title': null
            });
        }

        $scope.view = localStorageService.get('homeView') || 'News';
        $scope.views = ['News', 'Teams', 'Tasks'];
        $scope.loading = false;
        $scope.allMessages = false;
        //$scope.showDetail = false;

        $scope.setView = function(view) {

            $scope.view = view;
            localStorageService.add('homeView', view);

            switch (view) {
                case 'Teams':
                    Teamservice.getTeams(true).then(function(teams) {
                        setTitle();
                        $scope.teams = teams;
                    });
                    break
                case 'News':
                    Messageservice.getAll(new Date().toISOString(), true).then(function(msgs) {
                        setTitle();
                        $scope.messages = msgs;
                    });
                    break
                case 'Tasks':
                    Taskservice.getCurrentByUser(true).then(function(tasks) {
                        setTitle();
                        $scope.tasks = tasks;
                    });
                    break
            }

        };

        $scope.setView($scope.view);

        $scope.$on('refresh', function() {
            removeTitle();
            switch ($scope.view) {
                case 'Teams':
                    Teamservice.getTeams(false).then(function(teams) {
                        setTitle();
                        $scope.teams = teams;
                    }, function() {
                        setTitle();
                    });
                    break
                case 'News':
                    Messageservice.getNew($scope.messages[0].date).then(function(msgs) {
                        setTitle();
                        if (msgs.length != 0) {
                            $scope.messages.unshift(msgs);
                        }
                    }, function() {
                        setTitle();
                    });
                    break
                case 'Tasks':
                    Taskservice.getCurrentByUser(false).then(function(tasks) {
                        setTitle();
                        $scope.tasks = tasks;
                    }, function() {
                        setTitle();
                    });
                    break
            }
        });

        $scope.isSelected = function(view) {
            return $scope.view === view;
        };

        $scope.teamDetail = function(id) {
            $location.url('/team/' + id);
        };

        $scope.loadMore = function() {
            if ($scope.loading) {
                return
            };
            $scope.loading = !$scope.loading;

            Messageservice.getAll($scope.messages[$scope.messages.length - 1].date, false).then(function(msgs) {
                if (msgs.length == 5) {
                    _.forEach(msgs, function(msg) {
                        $scope.messages.push(msg);
                    });
                } else if (msgs.length < 5 && msgs.length > 0) {
                    _.forEach(msgs, function(msg) {
                        $scope.messages.push(msg);
                    });
                    $scope.allMessages = true;
                } else {
                    $scope.allMessages = true;
                }


                $scope.loading = !$scope.loading;
            });

        };

    });
