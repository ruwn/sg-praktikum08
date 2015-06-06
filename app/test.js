angular.module('MyApp', ['ngMaterial']).
    factory('Mail', function ($http) {
        var items = [];
        return {
            getFolders: function () {
                return $http.get('http://localhost:3000/mailapi/folders');
            },
            selectFolder: function (folder) {
                return $http.get('http://localhost:3000/mailapi/shbyfolder/' + folder);
            },
            selectMail: function (mail) {
                var url = 'http://localhost:3000/mailapi/show/' + mail._id;
                console.log(url);
                return $http.get(url);
            },
            deleteMail: function (mail) {
                return $http.delete('http://localhost:3000/mailapi/deletemail/' + mail._id);
            },
            deleteFolder: function (folder) {
                return $http.delete('http://localhost:3000/mailapi/deletefolder/' + folder);
            },
            renameFolder: function (folder, newName) {
                return $http.put('http://localhost:3000/mailapi/updfoldername/' + folder, {folder: newName});
            },
            moveFolder: function (mail, newName) {
                return $http.put('http://localhost:3000/mailapi/movemail/'+mail._id, {folder: newName});
            },
            newMail: function (mail) {
                var recipients = mail.rec.split(';');
                var paras = {sender: mail.sender, recipients: recipients, text: mail.text,subject: mail.subject,date: mail.date, folder:mail.folder};
                console.log(paras);
                return $http.post('http://localhost:3000/mailapi/createmail', paras);
            }

        };
    }).
    controller('RenameCtrl', function ($scope, $mdBottomSheet, Mail) {

        $scope.okRename = function () {
            console.log($scope.newFoldername);
            console.log($scope.selectedFolder);

            Mail.renameFolder($scope.selectedFolder, $scope.newFoldername).success(function (data, status, headers, config) {
                $scope.closeRename();
                Mail.getFolders().
                    success(function (data, status, headers, config) {
                        $scope.folders = data;
                        $scope.selectFolder($scope.newFoldername);
                    });
            });
        };

        $scope.closeRename = function () {
            $mdBottomSheet.hide();
        };
    }).
    controller('MoveCtrl', function ($scope, $mdBottomSheet, Mail) {

        console.log($scope.moveNewFolder);
        console.log($scope.selectedMail);
        $scope.okMove = function () {
            console.log($scope.moveNewFolder);
            console.log($scope.selectedMail);

            Mail.moveFolder($scope.selectedMail, $scope.moveNewFolder).success(function (data, status, headers, config) {
                $scope.closeMove();
                Mail.getFolders().
                    success(function (data, status, headers, config) {
                        $scope.folders = data;
                        $scope.selectFolder($scope.moveNewFolder);
                    });
            });
        };

        $scope.closeMove = function () {
            $mdBottomSheet.hide();
        };
    }).
    controller('NewMailCtrl', function ($scope, $mdBottomSheet, Mail) {
        $scope.okNewMail = function () {
            $scope.newmail.folder = $scope.selectedFolder;
            Mail.newMail( $scope.newmail).
                success(function (data, status, headers, config) {
                    $scope.selectFolder($scope.selectedFolder);
                    $scope.closeNewMail();
                });
        };

        $scope.closeNewMail = function () {
            $mdBottomSheet.hide();
        };
    }).

    controller('PostsCtrl', function ($scope, $http,$mdBottomSheet, Mail) {
        $scope.ps = Mail;
        $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";
        $scope.selectedFolder = null;
        $scope.selectedMail = null;
        $scope.folderOperations = true;
        $scope.mailOperations = true;

        Mail.getFolders().
            success(function (data, status, headers, config) {
                $scope.folders = data;
            });

        $scope.selectFolder = function (folder) {
            $scope.selectedFolder = folder;
            Mail.selectFolder(folder).
                success(function (data, status, headers, config) {
                    $scope.mails = data;
                });
            if ($scope.selectedFolder === null) {
                $scope.folderOperations = true;
            } else {
                $scope.folderOperations = false;
            }
            console.log(folder);
        };


        $scope.selectMail = function (mail) {
            if (!mail) {
                $scope.selectedMail = null;
            } else {
                Mail.selectMail(mail).
                    success(function (data, status, headers, config) {
                        $scope.selectedMail = data;
                        console.log("test.js.$scope.selectMail: ");
                        console.log(data);
                    });
            }
            if ($scope.selectedMail === null) {
                $scope.mailOperations = true;
                console.log("sollte nicht auftauchen");
            } else {
                console.log(selectedMail);
                $scope.mailOperations = false;
            }
        };

        $scope.deleteMail = function (mail) {

            Mail.deleteMail(mail).
                success(function (data, status, headers, config) {
                    $scope.selectFolder($scope.selectedFolder);
                    $scope.selectMail(null);
                });
        };

        $scope.deleteFolder = function (folder) {
            Mail.deleteFolder(folder).
                success(function (data, status, headers, config) {
                    Mail.getFolders().
                        success(function (data, status, headers, config) {
                            $scope.folders = data;
                            $scope.selectFolder(null);
                        });
                });
        };

        $scope.showRename = function ($event) {
            $mdBottomSheet.show({
                templateUrl: 'rename.html',
                controller: 'RenameCtrl',
                targetEvent: $event,
                scope: $scope
            }).then(function (clickedItem) {
            });
        };
        $scope.showMove = function ($event) {
            $mdBottomSheet.show({
                templateUrl: 'move.html',
                controller: 'MoveCtrl',
                targetEvent: $event,
                scope: $scope
            }).then(function (clickedItem) {
            });
        };
        $scope.showNewMail = function ($event) {
            $mdBottomSheet.show({
                templateUrl: 'newMail.html',
                controller: 'NewMailCtrl',
                targetEvent: $event,
                scope: $scope
            }).then(function (clickedItem) {
            });
        };

    }).config(function ($mdThemingProvider, $mdIconProvider) {
        $mdIconProvider
            .defaultIconSet("./assets/svg/avatars.svg", 128)
            .icon("menu", "./assets/svg/menu.svg", 24)
            .icon("share", "./assets/svg/share.svg", 24)
            .icon("google_plus", "./assets/svg/google_plus.svg", 512)
            .icon("hangouts", "./assets/svg/hangouts.svg", 512)
            .icon("twitter", "./assets/svg/twitter.svg", 512)
            .icon("phone", "./assets/svg/phone.svg", 512);

        $mdThemingProvider.theme('default')
            .primaryPalette('brown')
            .accentPalette('amber',{'default':'A700'});

    });

