(function () {
    'use strict';

    angular.module('sprintApp')
        .factory('dataService', Data);


    Data.$inject = ['$http', 'Upload'];

    function Data($http, Upload) {
        return {

            avvisi: {
                getAttivi: function () {
                    return $http.get('flows/api/avvisiattivi');
                }
            },
            authentication: {
                impersonate: function (username) {
                    return $http.get('impersonate/start?impersonate_username=' + username);
                },
                cancelImpersonate: function () {
                    return $http.get('impersonate/exit');
                },
            },
            tasks: {
                myTasks: function (processDefinition, firstResult, maxResults, order, params) {
                    return $http.post('api/tasks/mytasks?processDefinition=' + (processDefinition ? processDefinition : 'all') +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults +
                        '&order=' + order, params);
                },
                myTasksAvailable: function (processDefinition, firstResult, maxResults, order, params) {
                    return $http.post('api/tasks/availabletasks?processDefinition=' + (processDefinition ? processDefinition : 'all') +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults +
                        '&order=' + order, params);
                },
                complete: function (data) {
                    return $http.post('api/tasks/complete', data);
                },
                claim: function (id, take) {
                    return $http({
                        url: 'api/tasks/claim/' + id,
                        method: take ? 'PUT' : 'DELETE',
                    });
                },
                reassign: function (taskId, processInstanceId, assignee) {
                    return $http({
                        url: 'api/tasks/reassign/?' +
                            'assignee=' + assignee + '&' +
                            (taskId ? 'taskId=' + taskId + '&' : '') +
                            (processInstanceId ? 'processInstanceId=' + processInstanceId : ''),
                        method: 'PUT',
                    });
                },
                getTask: function (id) {
                    return $http.get('api/tasks/' + id);
                },
                getTaskCompletedByMe: function (processDefinition, firstResult, maxResults, order, params) {
                    return $http.post('api/tasks/taskCompletedByMe?processDefinition=' + (processDefinition ? processDefinition.key : 'all') +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults +
                        '&order=' + order, params);
                },
                taskAssignedInMyGroups: function (processDefinition, firstResult, maxResults, order, params) {
                    return $http.post('api/tasks/taskAssignedInMyGroups?processDefinition=' + (processDefinition ? processDefinition : 'all') +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults +
                        '&order=' + order, params);
                },
                getAttachments: function (taskId) {
                    return $http.get('api/attachments/task/' + taskId);
                },
                search: function (params) {
                    return $http.post('api/tasks/search/', params);
                },
                coolAvailableTasks: function () {
                    return $http.get('api/tasks/coolAvailableTasks');
                }
            },
            processInstances: {
                byProcessInstanceId: function (processInstanceId, detail) {
                    return $http.get('api/processInstances' +
                        '?processInstanceId=' + processInstanceId +
                        '&detail=' + ((detail !== undefined) ? true : false));
                },
                myProcessInstances: function (processDefinitionKey, active, firstResult, maxResults, order, params) {
                    return $http.post('api/processInstances/myProcessInstances?active=' + active +
                        '&processDefinitionKey=' + (processDefinitionKey ? processDefinitionKey : 'all') +
                        '&order=' + order +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults, params);
                },
                getAttachments: function (processInstanceId) {
                    return $http.get('api/attachments/' + processInstanceId);
                },
                attachmentHistory: function (processInstaceId, attachmentName) {
                    return $http.get('api/attachments/history/' + processInstaceId + '/' + attachmentName);
                },
                search: function (params) {
                    return $http.post('api/search/', params);
                },
                exportSummary: function (processInstaceId) {
                    return $http.get('api/summaryPdf?processInstanceId=' + processInstaceId);
                },
                deleteProcessInstance: function (processInstaceId, deleteReason) {
                    return $http.delete('api/processInstances/deleteProcessInstance?processInstanceId=' + processInstaceId + '&deleteReason=' + deleteReason);
                },
                setVariable: function (processInstanceId, variableName, value) {
                    return $http.post('api/processInstances/variable' +
                        '?processInstanceId=' + processInstanceId +
                        '&variableName=' + variableName +
                        '&value=' + value);
                },
                getVariable: function (processInstanceId, variableName) {
                    return $http.get('api/processInstances/variable?' +
                        'processInstanceId=' + processInstanceId +
                        '&variableName=' + variableName);
                },
                getHistoryForPi: function (processInstanceId) {
                    return $http.get('api/processInstances/getHistoryForPi?' +
                        'processInstanceId=' + processInstanceId);
                }
            },
            attachments: {
                pubblicaDocumento: function (processInstanceId, attachmentName, flag) {
                    return $http.post('/api/attachments/' + processInstanceId + '/' + attachmentName + '/pubblica?pubblica=' + flag);
                },
                pubblicaDocumentoTrasparenza: function (processInstanceId, attachmentName, flag) {
                    return $http.post('/api/attachments/' + processInstanceId + '/' + attachmentName + '/pubblicaTrasparenza?pubblica=' + flag);
                },
                pubblicaDocumentoUrp: function (processInstanceId, attachmentName, flag) {
                    return $http.post('/api/attachments/' + processInstanceId + '/' + attachmentName + '/pubblicaUrp?pubblica=' + flag);
                },
            },
            definitions: {
                all: function (includeSuspended) {
                    return $http.get('api/processDefinitions/all?'+ (includeSuspended?"includeSuspended=true":"") );
                },
                activate:  function (key) {
                    return $http.post('api/processDefinitions/activate/'+ key);
                },
                suspend: function (key) {
                    return $http.post('api/processDefinitions/suspend/'+ key);
                }
            },
            dynamiclist: {
                byName: function (name) {
                    return $http.get('api/dynamiclists/byname/' + name);
                },
            },
            sigladynamiclist: {
                byName: function (name) {
                    return $http.get('api/sigladynamiclist/byname/' + name);
                },
            },
            oil: {
                byCategory: function (category) {
                    return $http.get('api/proxy/OIL/?proxyURL=catg/HDSiper/');
                }
            },
            view: function (processid, version, type) {
                return $http.get('api/views/' + processid + '/' + version + '/' + type);
            },
            search: {
                users: function (filter) {
                    return $http.get('api/users/' + filter + '/search');
                },
                flowsUsers: function (filter) {
                    return $http.get('api/flows/users/' + filter + '/search');
                },
                flowsGroups: function (filter) {
                    return $http.get('api/cnrgroups/' + filter + '/search');
                },
                uo: function (filter) {
                    return $http.get('api/users/struttura/' + filter + '/search');
                },
                dipartimentiList: function (tipo) {
                    return $http.get('api/users/dipartimenti/' + tipo + '/search');
                },
                exportCsv: function (searchParams, firstResult, maxResults) {
                    var processDefinitionKey;
                    if (searchParams.processDefinitionKey !== undefined) {
                        processDefinitionKey = searchParams.processDefinitionKey;
                    } else {
                        processDefinitionKey = 'all';
                    }
                    return $http.post('api/search/exportCsv/' + processDefinitionKey +
                        '?active=' + searchParams.active +
                        '&order=' + searchParams.order +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults, searchParams);
                },
                exportCsvAndSaveInProcess: function (searchParams, firstResult, maxResults) {
                    var processDefinitionKey;
                    if (searchParams.processDefinitionKey !== undefined) {
                        processDefinitionKey = searchParams.processDefinitionKey;
                    } else {
                        processDefinitionKey = 'all';
                    }
                    var processInstanceId = searchParams.processInstanceId;
                    return $http.post('api/search/exportCsvAndSaveInProcess/' + processDefinitionKey + '/' + processInstanceId +
                        '?active=' + searchParams.active +
                        '&order=' + searchParams.order +
                        '&firstResult=' + firstResult +
                        '&maxResults=' + maxResults, searchParams);
                },
            },
            lookup: {
                uo: function (id) {
                    return $http.get('api/lookup/ace/uo/' + id);
                },
                users: function (username) {
                    return $http.get('api/lookup/ldap/user/' + username);
                },
                mycdsuos: function () {
                    return $http.get('api/lookup/ace/user/cdsuoabilitate');
                },
                boss: function () {
                    return $http.get('api/lookup/ace/boss');
                }
            },
            mail: {
                isActive: function () {
                    return $http.get('api/mail/active');
                },
                setActive: function (active) {
                    return $http.post('api/mail/active?active=' + active);
                },
                getUsers: function () {
                    return $http.get('api/mail/users');
                },
                setUsers: function (users) {
                    return $http.post('api/mail/users?users=' + users);
                },
            },
            userMemberships: {
                groupsForUser: function () {
                    return $http.get('api/memberships/groupsForUser');
                },
                membersByGroupName: function (groupName) {
                    return $http({
                        url: 'api/memberships/membersByGroupName',
                        method: 'GET',
                        params: {
                            groupName: groupName,
                        },
                    });
                },
                createMembership: function (groupName, userName, groupRole) {
                    return $http({
                        url: 'api/createMemberships?',
                        method: 'POST',
                        params: {
                            groupName: groupName,
                            userName: userName,
                            groupRole: groupRole,
                        }
                    });
                },
            },
            exportStatistics: {
                pdf: function (processDefinitionKey, startDateGreat, startDateLess) {
                    return $http({
                        url: 'api/makeStatisticPdf?',
                        method: 'GET',
                        params: {
                            processDefinitionKey: processDefinitionKey,
                            startDateGreat: startDateGreat,
                            startDateLess: startDateLess,
                        },
                    });
                },
                csv: function (processDefinitionKey, startDateGreat, startDateLess) {
                    return $http({
                        url: 'api/makeStatisticCsv?',
                        method: 'GET',
                        params: {
                            processDefinitionKey: processDefinitionKey,
                            startDateGreat: startDateGreat,
                            startDateLess: startDateLess,
                        },
                    });
                }
            },
            helpdesk: {
                sendWithAttachment: function (data) {
                    return Upload.upload({
                        url: 'api/helpdesk/sendWithAttachment',
                        method: 'Post',
                        data: data,
                    });
                },
                sendWithoutAttachment: function (hdDataModel) {
                    return $http.post("api/helpdesk/sendWithoutAttachment", hdDataModel)
                }
            },
            manuali: {
                getElenco: function () {
                    return $http.get("api/manual");
                },
                getManuale: function (nameFile) {
                    return $http({
                        url: 'api/manual/doc',
                        method: 'GET',
                        params: {
                            nameFile: nameFile
                        },
                    });
                }
            },
            faq: {
                getReadable: function () {
                    return $http.get("api/faqs/readable");
                },
                getReadableForProcessDefinition: function (procesDefinition) {
                    return $http.get("api/faqs/readableForProcessDefinition/" + procesDefinition);
                }
            },
            draft: {
                getDraftByTaskId: function (taskId, isShared) {
                    return $http({
                        url: 'api/draft/getDraftByTaskId',
                        method: 'GET',
                        params: {
                            taskId: taskId,
                            isShared: isShared
                        },
                    });
                },
                getDraftByProcessDefinitionId: function (processDefinitionId) {
                    return $http({
                        url: 'api/draft/getDraftByProcessDefinitionId',
                        method: 'GET',
                        params: {
                            processDefinitionId: processDefinitionId
                        }
                    });
                },
                updateDraft: function (taskId, json, processDefinitionId, isShared) {
                    return $http({
                        url: 'api/drafts/updateDraft?',
                        method: 'PUT',
                        params: {
                            taskId: taskId ? taskId : '',
                            processDefinitionId: processDefinitionId ? processDefinitionId: '',
                            isShared: isShared ? isShared : false
                        },
                        data: json
                    });
                }
            },
            signMany: function (username, password, otp, ids) {
                return $http({
                    url: "api/tasks/signMany",
                    method: 'POST',
                    params: {
                        username: username,
                        password: password,
                        otp: otp,
                        taskIds: ids
                    }
                })
            }
        };
    }
})();