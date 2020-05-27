/**
 * 设置-流程
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req', 'Common', 'laydate', 'OTree'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var laydate = layui.laydate;
    var Dialog = layui.Dialog;
    var Common = layui.Common;
    var Req = layui.Req;
    var OTree = layui.OTree;
    var deptMemberList = [];      // 部门成员

    function loadDeptMemberList() {
        var url = $('input[name=depatMemberList]').val();
        Req.getReq(url, function(res) {
            if(res.status) {
                deptMemberList = res.data.data;
            }
        });
    }

    function setAutoHeight() {

        var flowSetHeight = $('.flow-set').height();
        var parkListHeight = $('.parkList ul').height();
        $('.parkList').height(Math.max(flowSetHeight, parkListHeight));
        $('.flow-set').height(Math.max(flowSetHeight, parkListHeight));
    }

    function init() {
        loadDeptMemberList();
        setAutoHeight();
    }

    // 规则
    function getRuleHtml() {
        return '<p>1. 在同一个审批节点上，可以设置<b>审批人</b>和<b>协同审批人</b>。审批人和协同审批人会同时收到审批待办提醒。</p>' +
                '<p>&nbsp;</p>'+
                '<p>2. 审批人控制流程向后流转或退回，协同审批人只能发表参考意见。</p>' +
                '<p>&nbsp;</p>'+
                '<p>3. 除最后节点，其他审批节点允许不设置审批人，只设置协同审批人。此时，所有协同审批人都需发表意见，且最后一人发表意见后，流程自动提交至下一节点。</p>' +
                '<p>&nbsp;</p>'+
                '<p>4. 审批时限到达时，系统自动按规则催促审批人和协同审批人。</p>';
    }

    // 超时处理
    function getOverTimeOpts() {
        var _html = '<select name="overTime" lay-filter="overTime">';
        if(hoverTimeCodeList && hoverTimeCodeList.length) {
            hoverTimeCodeList.forEach(function(item, index) {
                _html += '<option value="'+ item.codeValue +'">'+ item.codeKey +'</option>';
            });
        }
        _html += '</select>';
        return _html;
    }

    // 审批时限
    function getTimeLimitOpts() {
        var _html = '<select name="timeLimit" lay-filter="timeLimit">';
        if(timeLimitCodeList && timeLimitCodeList.length) {
            timeLimitCodeList.forEach(function(item, index) {
                _html += '<option value="'+ item.codeValue +'">'+ item.codeKey +'</option>';
            });
        }
        _html += '</select>';
        return _html;
    }

    // 同一人不允许同时出现在审批人、建议者或否决者里
    function checkAVA(data) {
        var approverName = data.approverName,
            approverId = data.approverId,
            // vetoerName = !data.vetoerName ? '' : data.vetoerName.split(','),
            // vetoerId = !data.vetoerId ? '' : data.vetoerId.split(','),
            adviserName = !data.adviserName ? '' : data.adviserName.split(','),
            adviserId = !data.adviserId ? '' : data.adviserId.split(',');

        if(approverId) {
            // 审批人是否出现在否决者、建议者里边
            // if(vetoerId && vetoerId.length) {
            //     for(var i = 0; i < vetoerId.length; i++) {
            //         if(approverId == vetoerId[i]) {
            //             Dialog.errorDialog('同一人不允许同时出现在审批人、建议者或否决者里');
            //             return false;
            //         }
            //     }
            // }
            if(adviserId && adviserId.length) {
                for(var i = 0; i < adviserId.length; i++) {
                    if(approverId == adviserId[i]) {
                        Dialog.errorDialog('同一人不允许同时出现在审批人、协同审批人里');
                        return false;
                    }
                }
            }
        }

        // if(vetoerId && vetoerId.length) {
        //     if(adviserId && adviserId.length) {
        //         for(var i = 0; i < vetoerId.length; i++) {
        //             var tempId = vetoerId[i];
        //             for(var j = 0; j < adviserId.length; j++) {
        //                 if(tempId == adviserId[j]) {
        //                     Dialog.errorDialog('同一人不允许同时出现在审批人、建议者或否决者里');
        //                     return false;
        //                 }
        //             }
        //         }
        //     }
        // }
        return true;
    }

    // 审批时限
    function getLimitHtml() {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">审批时限</label>' +
                                '<div class="layui-input-block">' +
                                    getTimeLimitOpts() +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">超时处理</label>' +
                                '<div class="layui-input-block">' +
                                    getOverTimeOpts() +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">静音时段<i class="iconfont ibs-ico-helpnormal font-12 ml-5" title="静音时段内，审批人不会收到超时催促提醒"></i></label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="muteTime" class="layui-input" placeholder="yyyy-mm-dd ~ yyyy-mm-dd" id="muteTime" autocomplete="off">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 导入流程
    function getImportFlowHtml() {
        var targetParkId = $('input[name=targetparkId]').val();
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">目标园区</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="park" lay-filter="park" lay-verify="required" lay-reqText="请选择园区" lay-search>' +
                                        '<option value="">请选择园区</option>';

        parkList.forEach(function(item, index) {
           _html += '<option value="'+ item.deptId +'">'+ item.deptName +'</option>';
        });
        _html +=

                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">目标流程</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="flow" lay-filter="flow" lay-verify="required" lay-reqText="请选择流程" lay-search>' +
                                        '<option value="">请选择流程</option>'+
                                    '</select>'+
                                '</div>' +
                            '</div>' +
                            '<input type="hidden" value="'+ targetParkId +'" name="targetparkId">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 批量导入流程
    function getBatchImportFlowHtml() {
        var targetParkId = $('input[name=targetparkId]').val();
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">目标园区</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="park" lay-filter="park" lay-verify="required" lay-reqText="请选择园区" lay-search>' +
                                        '<option value="">请选择（支持模糊搜索）</option>';

                                        parkList.forEach(function(item, index) {
                                            _html += '<option value="'+ item.deptId +'">'+ item.deptName +'</option>';
                                        });
                                _html +=

                                    '</select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item" style="height: 120px; overflow-y: scroll;">' +
                                '<label class="layui-form-label">目标流程</label>' +
                                '<div class="layui-input-block allFlow hidden">' +
                                    '<input type="checkbox" name="allFlow" lay-filter="allFlow" lay-skin="primary" title="全选">' +
                                '</div>' +
                                '<div class="layui-input-block flowItemWrap hidden">' +

                                '</div>' +
                                '<div class="layui-form-mid noFlow" style="color:#ccc;">无目标流程</div>' +
                            '</div>' +
                                    '<input type="hidden" value="'+ targetParkId +'" name="targetparkId">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getAddNodeHtml(data) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label" style="width: 90px;">审批人<i class="iconfont ibs-ico-helpnormal c-gray-light" title="审批人决定流程向后流转或退回"></i></label>' +
                                '<div class="layui-input-block" style="margin-left: 120px;">' +
                                    '<input type="text" name="approverName" value="'+ data.approverName +'" placeholder="请选择审批人" autocomplete="off" class="layui-input" readonly>'+
                                    '<input type="hidden" name="approverId" value="'+ data.approverId +'">' +
                                '</div>' +
                            '</div>' +
                            // '<div class="layui-form-item">' +
                            //     '<label class="layui-form-label">否决者<i class="iconfont ibs-ico-helpnormal c-gray-light" title="可发表意见、否决或退回"></i></label>' +
                            //     '<div class="layui-input-block">' +
                            //         '<input type="text" name="vetoerName" value="'+ data.vetoerName +'" placeholder="请选择否决者" autocomplete="off" class="layui-input" readonly>'+
                            //         '<input type="hidden" name="vetoerId" value="'+ data.vetoerId +'">' +
                            //     '</div>' +
                            // '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label" style="width: 90px;">协同审批人<i class="iconfont ibs-ico-helpnormal c-gray-light" title="协同审批人只能发表参考意见，流程是否向后流转由审批人控制。但如果节点未设置审批人，则所有的协同审批人都发表意见后流程自动向后流转。"></i></label>' +
                                '<div class="layui-input-block" style="margin-left: 120px;">' +
                                    '<input type="text" name="adviserName" value="'+ data.adviserName +'" placeholder="请选择协同审批人" autocomplete="off" class="layui-input" readonly>'+
                                    '<input type="hidden" name="adviserId" value="'+ data.adviserId +'">' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 批量替换审批人员
    function getBatchReplaceHtml() {
        var _html = '';
        var targetParkId = $('input[name=targetparkId]').val();
        _html += '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">审批人</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="approver" class="layui-input" lay-verify="required" lay-reqText="需要被替换的审批人/协同审批人" placeholder="需要被替换的审批人/协同审批人" autocomplete="off">' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">替换为</label>' +
                                '<div class="layui-input-block">' +
                                    '<input type="text" name="replacer" class="layui-input" lay-verify="required" lay-reqText="请选择替换人员" readonly autocomplete="off">' +
                                    '<input type="hidden" name="replacerId" class="layui-input" autocomplete="off">' +
                                '</div>' +
                            '</div>' +

                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label">替换范围</label>' +
                                '<div class="layui-input-block">' +
                                    '<select name="replaceRange" lay-filter="replaceRange">';
            rangeList.forEach(function(item, index) {
                _html += '<option value="'+ item.codeValue +'">'+ item.codeKey +'</option>';
            });
            _html +=
                                    '</select>'+
                                '</div>' +
                            '</div>' +
                            '<input type="hidden" value="'+ targetParkId +'" name="targetparkId">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function setFlowStepHtml($target, data, type) {
        var approverName = !data.approverName ? '----' : data.approverName,
            approverId = data.approverId,
            vetoerName = !data.vetoerName ? [] : data.vetoerName.split(','),
            vetoerId = !data.vetoerId ? [] : data.vetoerId.split(','),
            adviserName = !data.adviserName ? [] : data.adviserName.split(','),
            adviserId = !data.adviserId ? [] : data.adviserId.split(',');

        var res = vetoerName.concat(adviserName);

        var _html = '<div class="flow-step edit">' +
                        '<div class="t-cell">' +
                            '<span class="txt-01">'+ approverName +'</span>';
        if(res.length) {
            _html += '<span class="txt-02">'+ res.join('、') +'</span>';
        }
        _html +=

                        '</div>' +
                        '<div class="btn-edit">' +
                            '<a href="javascript:void(0);" class="addPre">插入前置节点</a>' +
                            '<a href="javascript:void(0);" class="editNode">编辑节点</a>' +
                        '</div>'+
                        '<a href="#" class="iconfont ibs-ico-close btn-close del"></a>' +
                        '<input type="hidden" value="'+ approverName +'" name="approverName[]">' +
                        '<input type="hidden" value="'+ approverId +'" name="approverId[]">' +
                        '<input type="hidden" value="'+ vetoerName.join(',') +'" name="vetoerName[]">' +
                        '<input type="hidden" value="'+ vetoerId.join(',') +'" name="vetoerId[]">' +
                        '<input type="hidden" value="'+ adviserName.join(',') +'" name="adviserName[]">'+
                        '<input type="hidden" value="'+ adviserId.join(',') +'" name="adviserId[]">'+
                    '</div>';
        if(type == '1') {
            // 添加
            _html += '<i class="iconfont ibs-ico-arrowline"></i>';
            $target.before(_html);
        } else if(type == '2') {
            // 编辑
            $target.replaceWith(_html);
        }

    }

    function doImportFlow(submitUrl, flowUrl, $target, parkId) {
        Dialog.formDialog({
            title: '导入流程',
            content: getImportFlowHtml(),
            btn: ['立即导入', '取消'],
            success: function(layero, index) {
                form.render();
                var $flowSelect = layero.find('select[name=flow]');
                form.on('select(park)', function(data) {
                    var tempUrl = flowUrl;
                    tempUrl += '&parkId=' + data.value + '&pid=' + parkId;
                    var _html = '<option value="">请选择流程</option>';
                    Req.getReq(tempUrl, function(res) {
                        if(res.status) {
                            var list = res.data.flowList;
                            list.forEach(function(item, index) {
                                _html += '<option value="'+ item.id +'">'+ item.name +'</option>';
                            });

                            $flowSelect.html(_html);
                            form.render();
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                });

                form.on('submit(bind)', function(data){
                    var param = data.field;

                    Req.postReq(submitUrl, param, function(res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                layer.close(index);
                                $('.ajaxFlowInfo.active').click();
                            });

                            // Req.getReq(res.data.pageUrl, function(res) {
                            //     $target.html(res.data.content);
                            // })
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        });
    }

    /**
     * 添加\编辑流程节点
     * @param $o
     * @param type 1: 添加   2：编辑
     */
    function addEditNode($o, type, data) {
        var title = '';
        if(type == '1') {
            title = '添加';
        } else if(type == '2') {
            title = '编辑';
        }
        Dialog.formDialog({
            title: title + '节点',
            content: getAddNodeHtml(data),
            success: function(layero, index) {
                var $approverName = layero.find('input[name=approverName]'),
                    $approverId = layero.find('input[name=approverId]'),
                    // $vetoerName = layero.find('input[name=vetoerName]'),
                    // $vetoerId = layero.find('input[name=vetoerId]'),
                    $adviserName = layero.find('input[name=adviserName]'),
                    $adviserId = layero.find('input[name=adviserId]');
                $approverName.click(function() {
                    if(!$approverName.val()) {
                        // 未添加过
                        OTree({
                            title: '选择人员',
                            isConfirmBtnShow: true,
                            type: false,
                            data: deptMemberList,
                            callback: function(instance) {
                                $approverName.val(instance.eidTextArr.join(','));
                                $approverId.val(instance.eidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            },
                            zIndex:99999999
                        });
                    } else {
                        OTree({
                            title: '选择人员',
                            isConfirmBtnShow: true,
                            type: false,
                            data: deptMemberList,
                            callback: function(instance) {
                                $approverName.val(instance.eidTextArr.join(','));
                                $approverId.val(instance.eidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            },
                            edit: [$approverId.val()],
                            zIndex:99999999
                        });
                    }
                });

                // $vetoerName.click(function() {
                //     if(!$vetoerName.val()) {
                //         // 未添加过
                //         OTree({
                //             title: '选择人员',
                //             isConfirmBtnShow: true,
                //             data: deptMemberList,
                //             callback: function(instance) {
                //                 $vetoerName.val(instance.eidTextArr.join(','));
                //                 $vetoerId.val(instance.eidArr.join(','));
                //                 instance.removeEventListener();
                //                 instance.$tree.remove();
                //             },
                //             zIndex:99999999
                //         });
                //     } else {
                //         OTree({
                //             title: '选择人员',
                //             isConfirmBtnShow: true,
                //             data: deptMemberList,
                //             callback: function(instance) {
                //                 $vetoerName.val(instance.eidTextArr.join(','));
                //                 $vetoerId.val(instance.eidArr.join(','));
                //                 instance.removeEventListener();
                //                 instance.$tree.remove();
                //             },
                //             edit: $vetoerId.val().split(','),
                //             zIndex:99999999
                //         });
                //     }
                // });

                $adviserName.click(function() {
                    if(!$adviserName.val()) {
                        // 未添加过
                        OTree({
                            title: '选择人员',
                            isConfirmBtnShow: true,
                            data: deptMemberList,
                            callback: function(instance) {
                                $adviserName.val(instance.eidTextArr.join(','));
                                $adviserId.val(instance.eidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            },
                            zIndex:99999999
                        });
                    } else {
                        OTree({
                            title: '选择人员',
                            isConfirmBtnShow: true,
                            data: deptMemberList,
                            callback: function(instance) {
                                $adviserName.val(instance.eidTextArr.join(','));
                                $adviserId.val(instance.eidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            },
                            edit: $adviserId.val().split(','),
                            zIndex:99999999
                        });
                    }
                });

                form.on('submit(bind)', function(data){

                    if(!$approverName.val() && !$adviserName.val()) {
                        // 审批人\否决者\建议者 三者必须选一个
                        Dialog.errorDialog('未设置人员，请检查');
                        return false;
                    }
                    if(!checkAVA(data.field)) {
                        return false;
                    }

                    setFlowStepHtml($o, data.field, type);
                    layer.close(index);
                    // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                    return false;
                });
            }
        })
    }

    $(function() {
        init();

        // 审批规则
        $(document).on('click', '.opendialog', function() {
            Dialog.tipDialog({
                title: '审批规则说明',
                content: getRuleHtml(),
                yesFn: function(index, layero) {
                    layer.close(index);
                }
            });
        });

        // 审批时限
        $(document).on('click', '.ajaxSetting', function() {
            var $o = $(this),
                url = $(this).attr('data-url'),
                timeLimit = $(this).attr('data-limit-date') || 8,
                overTime = $(this).attr('data-over-time') || 1,
                stopStart = $(this).attr('data-stop_start') || '22:00:00',
                stopEnd = $(this).attr('data-stop_end') || '08:00:00';

            Dialog.formDialog({
                title: '设置审批时限',
                content: getLimitHtml(),
                success: function(layero, index) {
                    laydate.render({
                        elem: '#muteTime',
                        type: 'time',
                        value: stopStart + ' ~ ' + stopEnd,
                        trigger: 'click',
                        range: '~' //开启日期范围，默认使用“_”分割
                    });
                    form.render();
                    form.val('formDialog', {
                        overTime: overTime,
                        timeLimit: timeLimit
                    });
                    form.on('submit(bind)', function(data){
                        var param = data.field,
                            muteTime = param.muteTime.split(' ');
                        param.startTime = muteTime[0];
                        param.endTime = muteTime[2];
                        var $timeLimit = layero.find('select[name=timeLimit]'),
                            $overTime = layero.find('select[name=overTime]');
                        var timeLimitText = $timeLimit.next().find('input').val(),
                            overTimeText = $overTime.next().find('input').val();

                        Req.postReq(url, param, function(res) {
                            $o.attr('data-limit-date', param.timeLimit);
                            $o.attr('data-over-time', param.overTime);
                            $o.attr('data-stop_start', param.startTime);
                            $o.attr('data-stop_end', param.endTime);
                            if(res.status) {
                                layer.close(index);
                                $o.attr('data-limit-date', param.timeLimit);
                                $o.attr('data-over-time', param.overTime);
                                $o.attr('data-stop_start', param.startTime);
                                $o.attr('data-stop_end', param.endTime);
                                $('.limitName').text(timeLimitText);
                                $('.handlerName').text(overTimeText);
                                Dialog.successDialog(res.msg);
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        /**
         * 流程设置
         */
        // 设置\编辑\取消流程
        $(document).on('click', '.addFlow, .editFlow, .cancelFlow', function(e) {
            e.stopPropagation();
            var $o = $(this),
                url = $o.attr('data-page-url'),
                $curIbsFlow = $o.parents('.ibs-collapse'),
                $curActionBtn = $curIbsFlow.find('.actionButton'),
                $curSaveBtn = $curIbsFlow.find('.saveButton'),
                $curFlowContent = $curIbsFlow.find('.flowContent');


            Req.getReq(url, function(res) {
                if(res.status) {
                    $curFlowContent.html(res.data.content);
                    if($o.hasClass('addFlow') || $o.hasClass('editFlow')) {
                        $curActionBtn.addClass('hidden');
                        $curSaveBtn.removeClass('hidden');
                    } else {
                        $curActionBtn.removeClass('hidden');
                        $curSaveBtn.addClass('hidden');
                    }
                }
            });
        });

        // 新插入节点
        $(document).on('click', '.add', function(e) {
            e.stopPropagation();
            var $o = $(this),
                param = {};
            param.approverName = '';
            param.approverId = '';
            param.vetoerName = '';
            param.vetoerId = '';
            param.adviserName = '';
            param.adviserId = '';
            addEditNode($o, 1, param);
        });
        // 编辑流程节点
        $(document).on('click', '.editNode', function() {
            var $flowStep = $(this).parents('.flow-step');
            var param = {};
            param.approverName = $flowStep.find('input[name="approverName[]"]').val();
            param.approverId = $flowStep.find('input[name="approverId[]"]').val();
            param.vetoerName = $flowStep.find('input[name="vetoerName[]"]').val();
            param.vetoerId = $flowStep.find('input[name="vetoerId[]"]').val();
            param.adviserName = $flowStep.find('input[name="adviserName[]"]').val();
            param.adviserId = $flowStep.find('input[name="adviserId[]"]').val();
            addEditNode($flowStep, 2, param)
        });
        // 插入前置节点
        $(document).on('click', '.addPre', function() {
            var $flowStep = $(this).parents('.flow-step'),
                param = {};
            param.approverName = '';
            param.approverId = '';
            param.vetoerName = '';
            param.vetoerId = '';
            param.adviserName = '';
            param.adviserId = '';
            addEditNode($flowStep, 1, param);
        });

        $(document).on('click', '.del', function() {
            var $flowStep = $(this).parents('.flow-step'),
                $arrow = $flowStep.next();
            $flowStep.remove();
            $arrow.remove();
        });

        // 保存
        $(document).on('click', '.saveFlow', function(e) {
            e.stopPropagation();
            var url = $(this).attr('data-url'),
                $curFlow = $(this).parents('form'),
                $saveButton = $(this).parent(),
                $curSaveBtn = $(this).parent(),
                $curActionBtn = $curSaveBtn.prev(),
                data = $curFlow.serializeArray();

            var $o = $(this),
                $curIbsFlow = $o.parents('.ibs-collapse'),
                $curFlowContent = $curIbsFlow.find('.flowContent');

            Req.postReq(url, data, function(res) {
                if(res.status) {
                    Req.getReq(res.data.pageUrl, function(res) {
                        $curFlowContent.html(res.data.content);
                        $curSaveBtn.addClass('hidden');
                        $curActionBtn.removeClass('hidden');
                        $('.ajaxFlowInfo.active').click();
                    });
                    Dialog.successDialog(res.msg);
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 导入流程
        $(document).on('click', '.importFlow', function(e) {
            e.stopPropagation();
            var $o = $(this),
                parkId = $o.attr('data-park-id'),
                $curIbsFlow = $o.parents('.ibs-collapse'),
                $curActionBtn = $curIbsFlow.find('.actionButton'),
                $curSaveBtn = $curIbsFlow.find('.saveButton'),
                $curFlowContent = $curIbsFlow.find('.flowContent');

            var checkUrl = $(this).attr('data-check-url'),
                submitUrl = $(this).attr('data-url'),
                flowUrl = $(this).attr('data-flow-url');

            Req.getReq(checkUrl, function(res) {
                if(res.status) {
                    // 已设置流程先提醒
                    Dialog.confirmDialog({
                        title: '导入流程',
                        content: '当前已设置有流程，继续导入将会覆盖现有流程，且不可恢复。确定要继续吗？',
                        btn: ['继续', '取消'],
                        yesFn: function(index, layero) {
                            layer.close(index);
                            doImportFlow(submitUrl, flowUrl, $curFlowContent, parkId);
                        }
                    });
                } else {
                    doImportFlow(submitUrl, flowUrl, $curFlowContent, parkId);
                }
            });
        });

        // 批量导入流程
        $(document).on('click', '.batchFlow', function(e) {
            e.stopPropagation();
            var checkUrl = $(this).attr('data-check-url'),
                submitUrl = $(this).attr('data-url'),
                flowUrl = $(this).attr('data-flow-url');

            Dialog.formDialog({
                title: '批量导入流程',
                content: getBatchImportFlowHtml(),
                btn: ['立即导入', '取消'],
                area: ['500px', '300px'],
                success: function(layero, index) {
                    form.render();
                    var $flowItemWrap = layero.find('.flowItemWrap'),
                        $noFlow = layero.find('.noFlow'),
                        $allFlow = layero.find('.allFlow');

                    form.on('select(park)', function(data) {
                        var tempUrl = flowUrl;
                        var _html = '';
                        tempUrl += '?parkId=' + data.value;
                        Req.getReq(tempUrl, function(res) {
                            if(res.status) {
                                var list = res.data.flowList;
                                list.forEach(function (item, index) {
                                    _html += '<input type="checkbox" class="flowItem" name="flowItem[]" lay-filter="flowItem" lay-skin="primary" value="' + item.id + '" title="' + item.name + '">';
                                });
                                if (list.length) {
                                    $allFlow.removeClass('hidden');
                                    $flowItemWrap.removeClass('hidden');
                                    $flowItemWrap.html(_html);
                                    $noFlow.addClass('hidden');
                                } else {
                                    $allFlow.addClass('hidden');
                                    $flowItemWrap.addClass('hidden');
                                    $flowItemWrap.html(_html);
                                    $noFlow.removeClass('hidden');
                                }
                                form.render(null, 'formDialog');
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        })
                    });

                    form.on('checkbox(flowItem)', function(data) {
                        var flowItemSize = layero.find('.flowItem').length;
                        var selectedFlowItem = layero.find('.flowItem:checked').length;

                        if(selectedFlowItem == flowItemSize) {
                            layero.find('input[name=allFlow]').prop('checked', true);
                        } else {
                            layero.find('input[name=allFlow]').prop('checked', false);
                        }
                        form.render();
                    });

                    form.on('checkbox(allFlow)', function(data) {
                        var $flowItems = layero.find('.flowItem');

                        var status = data.elem.checked;
                        if(status) {
                            $flowItems.prop('checked', true);
                        } else {
                            $flowItems.prop('checked', false);
                        }
                        form.render();
                    });

                    form.on('submit(bind)', function(data){
                        var param = data.field;

                        var selectedFlowItem = layero.find('.flowItem:checked').length;
                        if(!selectedFlowItem) {
                            Dialog.errorDialog('至少选择一个目标流程');
                            return false;
                        }

                        Req.postReq(checkUrl, param, function(res) {
                            if(res.status) {
                                Req.postReq(submitUrl, param, function(res) {
                                    if(res.status) {
                                        layer.close(index);
                                        Dialog.successDialog(res.msg, function () {
                                            $('.ajaxFlowInfo.active').click();
                                        });
                                    } else {
                                        Dialog.errorDialog(res.msg);
                                    }
                                });
                            } else {
                                Dialog.confirmDialog({
                                    title: '提示',
                                    content: res.msg,
                                    btn: ['继续', '取消'],
                                    yesFn: function(index, layero) {
                                        Req.postReq(submitUrl, param, function(res) {
                                            if(res.status) {
                                                Dialog.successDialog(res.msg, function () {
                                                    $('.ajaxFlowInfo.active').click();
                                                    layer.closeAll();
                                                });
                                                // Req.getReq(res.data.pageUrl, function(res) {
                                                //     $('.rightDiv').html(res.data.content);
                                                // })
                                            } else {
                                                Dialog.errorDialog(res.msg);
                                            }
                                        });
                                    }
                                });
                            }
                        });


                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            });
        });

        // 左侧列表
        $(document).on('click', '.ajaxFlowInfo', function() {
            var url = $(this).attr('data-url'),
                $o = $(this);
            Req.getReq(url, function(res) {
                $('.ajaxFlowInfo').removeClass('active');
                $o.addClass('active');
                $('.rightDiv').html(res.data.content);
                setAutoHeight();
            });
        });

        // 搜索园区
        $(document).on('click', '.ajaxSearch', function() {
            var url = $(this).attr('data-url'),
                keyword = $('input[name=keyword]').val();
            url = url + '?keyword=' + encodeURIComponent(keyword);

            Req.getReq(url, function(res) {
                if(res.status) {
                    $('.parkList').html(res.data.content);
                    // 左侧选中状态依赖于右侧标题
                    var title = $('.rightDiv .title').text();
                    var $ajaxFlowInfos = $('.ajaxFlowInfo');
                    $ajaxFlowInfos.removeClass('active');
                    $ajaxFlowInfos.each(function (i, o) {
                       if($(o).text() == title) {
                           $(o).addClass('active');
                       }
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });
        $(document).on('keydown', 'input[name=keyword]', function(e) {
            if (e.keyCode == 13) {
                $('.ajaxSearch').trigger('click');
            }
        });
        // trident内核搜索后再删除keyword，会失效
        // $(document).on('input propertychange', 'input[name=keyword]', Common.Util.debounce(function(e) {
        //     $('.ajaxSearch').trigger('click');
        // }, 500));
        $(document).on('keyup', 'input[name=keyword]', Common.Util.debounce(function(e) {
            $('.ajaxSearch').trigger('click');
        }, 500));

        // 展开关闭
        $(document).on('click', '.ibs-collapse .ibs-colla-title', function(e) {
            e.stopPropagation();
            var $o = $(this);
            var $collapseDiv = $o.find('.collapseDiv'),
                $flowContent = $o.next('.flowContent');

            if($collapseDiv.hasClass('ibs-ico-foldup')) {
                // 收起
                $collapseDiv.removeClass('ibs-ico-foldup').addClass('ibs-ico-folddown');
                $flowContent.slideUp();
            } else {
                $collapseDiv.removeClass('ibs-ico-folddown').addClass('ibs-ico-foldup');
                $flowContent.slideDown();
            }
        });

        // 批量替换人员
        $(document).on('click', '.batchPersonal', function() {
            var url = $(this).attr('data-url');
            Dialog.formDialog({
                title: '批量替换审批人员',
                content: getBatchReplaceHtml(),
                success: function(layero, index) {
                    var $approverName = layero.find('input[name=approverName]'),
                        $approverId = layero.find('input[name=approverId]'),
                        $vetoerName = layero.find('input[name=vetoerName]'),
                        $vetoerId = layero.find('input[name=vetoerId]'),
                        $adviserName = layero.find('input[name=adviserName]'),
                        $adviserId = layero.find('input[name=adviserId]');

                    var $replacer = layero.find('input[name=replacer]'),
                        $replacerId = layero.find('input[name=replacerId]');

                    $replacer.click(function() {
                        if(!$replacerId.val()) {
                            // 未添加过
                            OTree({
                                isConfirmBtnShow: true,
                                type: false,
                                data: deptMemberList,
                                callback: function(instance) {
                                    $replacer.val(instance.eidTextArr.join(','));
                                    $replacerId.val(instance.eidArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                zIndex:99999999
                            });
                        } else {
                            OTree({
                                isConfirmBtnShow: true,
                                type: false,
                                data: deptMemberList,
                                callback: function(instance) {
                                    $replacer.val(instance.eidTextArr.join(','));
                                    $replacerId.val(instance.eidArr.join(','));
                                    instance.removeEventListener();
                                    instance.$tree.remove();
                                },
                                edit: [$replacerId.val()],
                                zIndex:99999999
                            });
                        }
                    });
                    form.render();


                    form.on('submit(bind)', function(data){
                        Req.postReq(url, data.field, function(res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    $('.ajaxFlowInfo.active').click();
                                    layer.close(index);
                                });
                                // $('.rightDiv').html(res.data.content);
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        // 阻止表单跳转。如果需要表单跳转，去掉这段即可
                        return false;
                    });
                }
            })
        });

        form.on('submit', function() {
            return false;
        });
    });
});