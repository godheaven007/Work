/**
 * 设置-条件审批流程
 */

layui.use(['element', 'form', 'Dialog', 'Pager', 'Req', 'Common', 'laydate', 'OTree', 'OTree2'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var laydate = layui.laydate;
    var Dialog = layui.Dialog;
    var Common = layui.Common;
    var Req = layui.Req;
    var OTree = layui.OTree;
    var OTree2 = layui.OTree2;
    var subjectLen = 0;

    function init() {
        if(!conditionArr) {
            conditionArr = [];      // 已选择的审批条件
        } else {
            updateOptsStatus();
        }
        subjectLen = getSubjectLen();
    }

    function getConditionOpts() {
        var opts = '<option value="">请选择</option>';
        if(selectObj && Array.isArray(selectObj)) {
            selectObj.forEach(function (item, index) {
                var key = item.propertySubject;
                if(conditionArr.indexOf(key) != -1) {
                    opts += '<option value="'+ key +'" disabled data-key="'+ item.propertySubjectTo.propertyKey +'">'+ item.propertySubjectTo.propertyName +'</option>';
                } else {
                    opts += '<option value="'+ key +'" data-key="'+ item.propertySubjectTo.propertyKey +'">'+ item.propertySubjectTo.propertyName +'</option>';
                }
            });
        }
        return opts;
    }

    /**
     * 更新科目是否可选状态
     */
    function updateOptsStatus() {
        var $conditionItems = $('.conditionItem');

        $conditionItems.each(function (index, o) {
            var $curBox = $(o).find('.conditionBox').eq(0),
                options = $curBox.find('option');
            // 当前选择的节点id
            var curSelectSubId = conditionArr[index];

            for(var i = 0, len = options.length; i < len; i++) {
                if(options[i].value) {
                    if(curSelectSubId == options[i].value) {
                        // 当前选中节点
                        $(options[i]).prop('disabled', false);
                    } else {
                        if($.inArray(options[i].value, conditionArr) != -1) {
                            // 禁用已选择节点
                            $(options[i]).prop('disabled', true);
                        } else {
                            $(options[i]).prop('disabled', false);
                        }
                    }
                }
            }
        });

        form.render();
    }

    // 操作符下拉框
    function getSelectDownHtml(list) {
        var _html = '<select name="operator" lay-filter="operator">';

            list.forEach(function (item, index) {
                _html += '<option value="'+ item.propertyId +'" data-key="'+ item.propertyKey +'">'+ item.propertyName +'</option>';;
            });

        _html +='</select>';
        return _html;
    }

    // 【请选择】清空
    function doReset() {
        var _html = '<div class="layui-col-xs10 pr-10 conditionBox">' +
                        '<div class="layui-form-mid">' +
                            '<a href="" class="c-link ml-15 delOpt">删除此条件</a>' +
                        '</div>' +
                    '</div>';
        return _html;
    }
    // 申请人
    function doApply() {
        var _html = '<div class="layui-col-xs10 pr-10 conditionBox">' +
                        '<div class="layui-form-mid">' +
                            '<span>为</span>' +
                            '<span class="ml-5 personDeptName"></span>' +
                            '<a class="c-link ml-15 selectOrg">选择</a>' +
                            '<a href="" class="c-link ml-15 delOpt">删除此条件</a>' +
                            '<input type="hidden" name="personDept">' +
                        '</div>' +
                    '</div>';
        return _html;
    }

    function getFreeLeaseHtml(type) {
        if(type == 1) {
            return '<div class="layui-col-xs2 pr-10 conditionBox">' +
                        '<div class="input-units">' +
                            '<input type="text" name="freeLease" class="layui-input pr-30" lay-verify="required|onlyZeroInteger" autocomplete="off">' +
                            '<div class="unit">天</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="layui-col-xs6 pr-10">' +
                        '<div class="layui-form-mid"><a href="" class="c-link delOpt">删除此条件</a></div>' +
                    '</div>';
        } else {
            return '<div class="layui-col-xs4 pr-10 position-rel conditionBox">' +
                        '<div class="layui-col-xs6 pr-10">' +
                        '    <div class="input-units">' +
                        '        <input type="text" name="freeLease" class="layui-input pr-30" lay-verify="required|onlyZeroInteger" autocomplete="off">' +
                        '        <div class="unit">天</div>' +
                        '    </div>' +
                        '</div>' +
                        '<div class="layui-col-xs6 pl-10">' +
                        '    <div class="input-units">' +
                        '        <input type="text" name="freeLease" class="layui-input pr-30" lay-verify="required|onlyZeroInteger" autocomplete="off">' +
                        '        <div class="unit">天</div>' +
                        '    </div>' +
                        '</div>' +
                        '<div class="position-dash">~</div>' +
                    '</div>' +
                    '<div class="layui-col-xs4 pr-10">' +
                        '<div class="layui-form-mid">' +
                            '<a href="" class="c-link delOpt">删除此条件</a>' +
                        '</div>' +
                    '</div>';
        }
    }

    // 免租期
    function doFreeLease(operatorList) {
        var _html = '<div class="layui-col-xs2 pr-10 conditionBox">' +
                        getSelectDownHtml(operatorList) +
                    '</div>' +
                    '<div class="layui-col-xs2 pr-10 conditionBox">' +
                        '<div class="input-units">' +
                            '<input type="text" name="freeLease" class="layui-input pr-30" lay-verify="required|onlyZeroInteger" autocomplete="off">' +
                            '<div class="unit">天</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="layui-col-xs6 pr-10">' +
                        '<div class="layui-form-mid"><a href="" class="c-link delOpt">删除此条件</a>' +
                        '</div>' +
                    '</div>';
        return _html;
    }

    // 通用格式（selectDown,selectDown）
    function doCommon(operatorList, variableList) {
        var _html = '<div class="layui-col-xs2 pr-10 conditionBox">' +
                        getSelectDownHtml(operatorList) +
                    '</div>' +
                    '<div class="layui-col-xs2 pr-10 conditionBox">' +
                        getSelectDownHtml(variableList) +
                    '</div>' +
                    '<div class="layui-col-xs6 pr-10">' +
                        '<div class="layui-form-mid"><a href="" class="c-link delOpt">删除此条件</a>' +
                    '</div>';
        return _html;
    }

    // 招商审批单-保证金等checkbox类型
    function doCheckBoxType(codeTos) {
        var _html = '';
        if(Array.isArray(codeTos) && codeTos.length) {

            _html += '<div class="layui-col-xs10 pr-10 conditionBox">' +
                        '<div class="layui-form-mid">为</div>' +
                        '<div class="float-l">';
            codeTos.forEach(function (item, index) {
                _html += '<input type="checkbox" lay-skin="primary" title="'+ item.codeKey +'" value="'+ item.codeValue +'">';
            });
            _html +=
                        '</div>' +
                        '<div class="layui-form-mid"><a href="" class="c-link ml-15 delOpt">删除此条件</a></div>' +
                     '</div>';
        }
        return _html;
    }

    function getCurSubjectData(subjectId) {
        for(var i = 0, len = selectObj.length; i < len; i++) {
            if(selectObj[i].propertySubject == subjectId) {
                return selectObj[i];
            }
        }
    }

    // 选择【申请人、租金单价】等科目操作
    function handleSubject(subjectId, $curConditionItem) {
        var _html = '';

        if(subjectId) {
            var data = getCurSubjectData(subjectId),
                subjectTo = data.propertySubjectTo,
                operatorList = data.propertyOperatorList,
                variableList = data.propertyVariableList;
            var inputType = subjectTo.propertyInputType,
                subjectName = subjectTo.propertyKey;
        }

        if(!subjectId) {
            _html = doReset();
        } else if(subjectName == 'applyId') {
            // 申请人
            _html = doApply();
        } else if(subjectName == 'freeLease') {
            // 免租期
            _html = doFreeLease(operatorList);
        } else if(inputType == 'checkBox') {
            // 招商审批单-保证金等
            _html = doCheckBoxType(subjectTo.codeTos);
        } else if(inputType == 'selectDown,selectDown'){
            _html = doCommon(operatorList, variableList);
        }

        var $curFirstConBox = $curConditionItem.find('.conditionBox').eq(0);
        $curFirstConBox.nextAll().remove();
        $curFirstConBox.after(_html);
        showAddDelOpt();
        form.render();
    }

    // 获取科目长度
    function getSubjectLen() {
        if(selectObj) {
            return selectObj.length;
        }
    }

    // 是否显示【删除此条件】【添加条件按钮】
    function showAddDelOpt() {
        var $conditionItems = $('.conditionItem');
        if($conditionItems.length < subjectLen) {
            $('.addOpt').removeClass('hidden');
        } else {
            $('.addOpt').addClass('hidden');
        }
        if($conditionItems.length == 1) {
            $conditionItems.eq(0).find('.delOpt').addClass('hidden');
        } else {
            $conditionItems.find('.delOpt').removeClass('hidden');
        }
    }

    function getConditionData() {
        var result = [];
        var $conditionItems = $('.conditionItem');
        $conditionItems.each(function (i, o) {
            var $curItem = $(o),
                $curFistConBox = $curItem.find('.conditionBox').eq(0),
                $curSecondBox = $curItem.find('.conditionBox').eq(1),
                $curThirdBox = $curItem.find('.conditionBox').eq(2),
                subjectId = $curFistConBox.find('option:selected').val(),
                subjectKey = $curFistConBox.find('option:selected').attr('data-key'),
                subjectName = $curFistConBox.find('input').val();
            var param = {};

            if(subjectName) {
                param.propertySubId = subjectId;

                if(subjectKey == 'applyId') {
                    // 申请人
                    param.propertyOperateId = '';
                    param.propertyVariableId = '';
                    param.propertyVal = $curSecondBox.find('input[name=personDept]').val();
                    param.propertyShow = $curSecondBox.find('.personDeptName').attr('data-title');
                    param.propertySplicing = '';
                } else if(subjectKey == 'freeLease') {
                    // 免租期
                    param.propertyOperateId = $curSecondBox.find('option:selected').val();
                    param.propertyVariableId = '';

                    var $freeLease = $('input[name=freeLease]'),
                        propertyValArr = [];

                    $freeLease.each(function (i, o) {
                        propertyValArr.push($(o).val());
                    });

                    param.propertyVal = propertyValArr.join(',');
                    param.propertyShow = subjectName + $curSecondBox.find('option:selected').text() + propertyValArr.join('~') + '天';
                    param.propertySplicing = '';
                } else if(subjectKey == 'bond' || subjectKey == 'changeType' || subjectKey == 'accountReceiveApplyType') {
                    // 保证金、变更类型、类型
                    param.propertyOperateId = '';
                    param.propertyVariableId = '';

                    var $bonds = $curSecondBox.find('input[type=checkbox]:checked'),
                        propertyValArr = [],
                        propertyValNameArr = [];
                    $bonds.each(function (i, o) {
                        propertyValArr.push($(o).val());
                        propertyValNameArr.push($(o).attr('title'));
                    });

                    param.propertyVal = propertyValArr.join(',');
                    param.propertyShow = subjectName + '为' + propertyValNameArr.join('、');
                    param.propertySplicing = '';
                } else {
                    // 通用
                    param.propertyOperateId = $curSecondBox.find('option:selected').val();
                    param.propertyVariableId = $curThirdBox.find('option:selected').val();
                    param.propertyVal = '';
                    param.propertyShow = subjectName + $curSecondBox.find('option:selected').text() + $curThirdBox.find('option:selected').text();
                    param.propertySplicing = '';
                }
                result.push(param);
            }
        });

        return JSON.stringify(result);
    }

    /**
     * 审批流程
     */

    // 同一人不允许同时出现在审批人、协同审批人里
    function checkAVA(data) {
        var approverName = data.approverName,
            approverId = data.approverId,
            adviserName = !data.adviserName ? '' : data.adviserName.split(','),
            adviserId = !data.adviserId ? '' : data.adviserId.split(',');

        if(approverId) {
            if(adviserId && adviserId.length) {
                for(var i = 0; i < adviserId.length; i++) {
                    if(approverId == adviserId[i]) {
                        Dialog.errorDialog('同一人不允许同时出现在审批人、协同审批人里');
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function setFlowStepHtml($target, data, type) {
        var approverName = !data.approverName ? '----' : data.approverName,
            approverId = data.approverId,
            adviserName = !data.adviserName ? [] : data.adviserName.split(','),
            adviserId = !data.adviserId ? [] : data.adviserId.split(',');

        var _html = '<div class="flow-step edit editFlow">' +
            '<div class="t-cell">' +
            '<span class="txt-01">'+ approverName +'</span>';
        if(adviserName.length) {
            _html += '<span class="txt-02">'+ adviserName +'</span>';
        }
        _html +=

            '</div>' +
            '<div class="btn-edit">' +
                '<a href="javascript:void(0);" class="addPre">插入前置节点</a>' +
                '<a href="javascript:void(0);" class="editNode">编辑节点</a>' +
                '</div>'+
                '<a href="javascript:void(0);" class="iconfont ibs-ico-close btn-close del"></a>' +
                '<input type="hidden" value="'+ approverName +'" name="approverName[]">' +
                '<input type="hidden" value="'+ approverId +'" name="approverId[]">' +
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

        getDeptPersonList(function (res) {
            var deptPersonList = res.data.data;

            Dialog.formDialog({
                title: title + '节点',
                content: getAddNodeHtml(data),
                success: function(layero, index) {
                    var $approverName = layero.find('input[name=approverName]'),
                        $approverId = layero.find('input[name=approverId]'),
                        $adviserName = layero.find('input[name=adviserName]'),
                        $adviserId = layero.find('input[name=adviserId]');
                    // 审批人
                    $approverName.click(function() {
                        var treeParam = {
                            title: '选择人员',
                            isConfirmBtnShow: true,
                            type: false,
                            data: deptPersonList,
                            callback: function(instance) {
                                $approverName.val(instance.eidTextArr.join(','));
                                $approverId.val(instance.eidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            },
                            zIndex:99999999
                        };
                        if(!$approverName.val()) {
                            // 未添加过
                            OTree(treeParam);
                        } else {
                            treeParam.edit = [$approverId.val()];
                            OTree(treeParam);
                        }
                    });

                    // 协同审批人
                    $adviserName.click(function() {
                        var treeParam = {
                            title: '选择人员',
                            isConfirmBtnShow: true,
                            data: deptPersonList,
                            callback: function(instance) {
                                if(instance.eidArr.length > 5) {
                                    Dialog.errorDialog2({
                                        content: "协同审批人最多只能设置5个人",
                                        zIndex: 999999999
                                    });
                                    return false;
                                }
                                var tempEidTextArr = instance.eidTextArr.map(function (v) {
                                    return '[' + v + ']';
                                });

                                $adviserName.val(tempEidTextArr.join('、'));
                                $adviserId.val(instance.eidArr.join(','));
                                instance.removeEventListener();
                                instance.$tree.remove();
                            },
                            zIndex:99999999
                        };
                        if(!$adviserName.val()) {
                            // 未添加过
                            OTree(treeParam);
                        } else {
                            treeParam.edit = $adviserId.val().split(',');
                            OTree(treeParam);
                        }
                    });

                    form.on('submit(bind)', function(data){

                        if(!$approverName.val() && !$adviserName.val()) {
                            // 审批人\协同审批人 二者必须选一个
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
        });
    }

    function getDeptPersonList(cb) {
        var url = $('#deptpersonListAjaxUrl').val();
        Req.getReq(url, function (res) {
            cb(res)
        })
    }

    function renderCc(eidArr, eidTextArr) {
        var _html = '';
        if(Array.isArray(eidArr) && eidArr.length) {
            eidArr.forEach(function (v, index) {
                // _html += '<div class="flow-step">' +
                //             '<div class="t-cell">' +
                //                 '<span class="txt-01">'+ eidTextArr[index] +'</span>' +
                //             '</div>' +
                //             '<a href="#" class="iconfont ibs-ico-close btn-close delCc" data-empid="'+ v +'"></a>' +
                //     '</div>';
                _html += '<span class="label-box mr-5 mb-5">'+ eidTextArr[index] +'<i class="layui-icon ico-close delCc" data-empid="'+ v +'">ဆ</i></span>';
            })
        }
        $('.deptDiv').html(_html);
    }

    // 【申请人】可选择人或部门，超过5个对象时，简略显示
    function renderOrg($personDeptName, empDeptTextArr) {
        if(empDeptTextArr.length > 5) {
            var tempArr = $.extend(true, [], empDeptTextArr);
            tempArr = tempArr.splice(0, 5);
            var _html = tempArr.join('、') + '<a href="javascript:void(0);" class="c-link hoverTips" data-message="'+ empDeptTextArr.join('、') +'">等'+ empDeptTextArr.length +'个</a>'
            $personDeptName.html(_html);
        } else {
            $personDeptName.html(empDeptTextArr.join('、'));
        }
        $personDeptName.attr('data-title', empDeptTextArr.join('、'));
    }

    // 复选框至少选择一个
    function validateCheckbox() {
        var flag = true,
            $conditionItems = $('.conditionItem');

        $conditionItems.each(function (i, item) {
            var $curConditionItem = $(item),
                $curFirstBox = $curConditionItem.find('.conditionBox').eq(0),
                $box = $curConditionItem.find('input[type=checkbox]');

            if($box.length) {
                var $selectedBox = $curConditionItem.find('input[type=checkbox]:checked');
                if($selectedBox.length == 0) {
                    Dialog.errorDialog("【"+ $curFirstBox.find('option:selected').text() +"】选项至少选择一个");
                    flag = false;
                    return false;
                }
            }
        });

        return flag;
    }

    $(function() {
        init();

        // 添加
        $(document).on('click', '.addOpt', function (e) {
            e.preventDefault();
            var _html = '<div class="layui-row conditionItem">' +
                            '<div class="layui-col-xs2 pr-10 conditionBox">' +
                                '<select name="condition" lay-filter="condition">' +
                                    getConditionOpts() +
                                '</select>' +
                            '</div>' +
                            '<div class="layui-col-xs6 pr-10">' +
                                '<div class="layui-form-mid"><a href="" class="c-link delOpt">删除此条件</a></div>' +
                            '</div>' +
                        '</div>';
            $('.triggerCondition').append(_html);
            form.render();
            showAddDelOpt();
        });

        // 删除
        $(document).on('click', '.delOpt', function (e) {
            e.preventDefault();
            var $o = $(this),
                $curItem = $o.parents('.conditionItem'),
                $subjectBox = $curItem.find('.conditionBox').eq(0);
            var subjectId = $subjectBox.find('select option:selected').val();

            var index = conditionArr.indexOf(subjectId);
            if(index != -1) {
                conditionArr.splice(index, 1);
            }

            $o.parents('.conditionItem').remove();
            updateOptsStatus();
            showAddDelOpt();
        });

        // 选择申请人
        $(document).on('click', '.selectOrg', function (e) {
            e.preventDefault();
            var $personDept = $('input[name=personDept]'),
                $personDeptName = $('.personDeptName');

            getDeptPersonList(function (res) {
                if(!$personDept.val()) {
                    OTree2({
                        data: res.data.data,
                        callback: function(instance) {
                            $personDept.val(instance.empDeptArr.join(','));
                            renderOrg($personDeptName, instance.empDeptTextArr);
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        zIndex:99999999
                    });
                } else {
                    OTree2({
                        data: res.data.data,
                        callback: function(instance) {
                            $personDept.val(instance.empDeptArr.join(','));
                            renderOrg($personDeptName, instance.empDeptTextArr);
                            instance.removeEventListener();
                            instance.$tree.remove();
                        },
                        edit: $personDept.val().split(','),
                        zIndex:99999999
                    });
                }
            });
        });

        // 保存
        form.on('submit(component-form-demo1)', function(data) {
            var $elem = $(data.elem),
                url = $elem.attr('data-url');

            var $conditionItems = $('.conditionItem');

            if($conditionItems.length == 1) {
                var $firstConditonBox = $conditionItems.eq(0).find('.conditionBox').eq(0);
                if(!$firstConditonBox.find('input').val()) {
                    Dialog.errorDialog("触发条件：至少添加1个条件");
                    return false;
                }
            }

            var $personDept = $('input[name=personDept]');
            if($personDept.length && !$personDept.val()) {
                Dialog.errorDialog("未选择申请人");
                return false;
            }

            // 审批流程：至少设置1个节点
            if($('.editFlow').length == 0) {
                Dialog.errorDialog("审批流程：至少设置1个节点");
                return false;
            }

            // 免租期时间范围验证
            if($('input[name=freeLease]').length == 2) {
                var $freeLease1 = $('input[name=freeLease]').eq(0),
                    $freeLease2 = $('input[name=freeLease]').eq(1);
                if(parseFloat($freeLease1.val()) >= parseFloat($freeLease2.val())) {
                    Dialog.errorDialog("免租期时间范围不正确");
                    return false;
                }
            }

            // checkbox选项必选一个
            if(!validateCheckbox()) {
                return false;
            }

            var $form = $('form');
            Common.Util.replaceSerializeName2($form);
            var param = $form.serializeArray();
            // 触发条件
            param.push({name: "propertyReqs", value: getConditionData()});
            // console.log(param);
            // return false;
            Req.postReqCommon(url, param);

            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        });

        /**
         * 审批流程设置
         */
        // 新插入节点
        $(document).on('click', '.addFlow', function(e) {
            e.stopPropagation();
            var $o = $(this),
                param = {};
            param.approverName = '';
            param.approverId = '';
            param.adviserName = '';
            param.adviserId = '';
            addEditNode($o, 1, param);
        });

        // 插入前置节点
        $(document).on('click', '.addPre', function() {
            var $flowStep = $(this).parents('.flow-step'),
                param = {};
            param.approverName = '';
            param.approverId = '';
            param.adviserName = '';
            param.adviserId = '';
            addEditNode($flowStep, 1, param);
        });

        // 编辑流程节点
        $(document).on('click', '.editNode', function() {
            var $flowStep = $(this).parents('.flow-step');
            var param = {};
            param.approverName = $flowStep.find('input[name="approverName[]"]').val();
            param.approverId = $flowStep.find('input[name="approverId[]"]').val();
            param.adviserName = $flowStep.find('input[name="adviserName[]"]').val();
            param.adviserId = $flowStep.find('input[name="adviserId[]"]').val();
            addEditNode($flowStep, 2, param)
        });

        $(document).on('click', '.del', function() {
            var $flowStep = $(this).parents('.flow-step'),
                $arrow = $flowStep.next();
            $flowStep.remove();
            $arrow.remove();
        });


        /**
         * 自动抄送
         */

        $(document).on('click', '.addCc', function() {
            var $ccEmpIds = $('input[name=ccEmpIds]');

            getDeptPersonList(function (res) {
                var deptPersonList = res.data.data;

                var treeParam = {
                    title: '选择抄送人员',
                    isConfirmBtnShow: true,
                    data: deptPersonList,
                    callback: function(instance) {
                        if(instance.eidArr.length > 20) {
                            Dialog.errorDialog2({
                                content: "自动抄送最多只能选择20人",
                                zIndex: 999999999
                            });
                            return false;
                        }
                        renderCc(instance.eidArr, instance.eidTextArr);
                        $ccEmpIds.val(instance.eidArr.join(','));
                        instance.removeEventListener();
                        instance.$tree.remove();
                    },
                    zIndex:99999999
                };
                if(!$ccEmpIds.val()) {
                    // 未添加过
                    OTree(treeParam);
                } else {
                    treeParam.edit = $ccEmpIds.val().split(',');
                    OTree(treeParam);
                }
            });
        });

        $(document).on('click', '.delCc', function(e) {
            e.preventDefault();
            var $o = $(this),
                empId = $o.attr('data-empid');
            var $ccEmpIds = $('input[name=ccEmpIds]'),
                ccEmpIds = $ccEmpIds.val().split(',');

            var index = ccEmpIds.indexOf(empId);
            ccEmpIds.splice(index, 1);
            $ccEmpIds.val(ccEmpIds.join(','));
            $o.parent().remove();
        });


        // 科目选择
        form.on('select(condition)', function (data) {
            var $elem = $(data.elem),
                $curConditionItem = $elem.parents('.conditionItem');
            var index = $('.conditionItem').index($curConditionItem);

            if(data.value) {
                if($.inArray(data.value, conditionArr) == -1) {
                    conditionArr[index] = data.value;
                    handleSubject(data.value, $curConditionItem);

                    updateOptsStatus();
                }
            } else {
                conditionArr[index] = "";
                handleSubject(data.value, $curConditionItem);
                updateOptsStatus();
            }
        });

        // 操作符
        form.on('select(operator)', function (data) {
            var $elem = $(data.elem),
                $curConditionBox = $elem.parents('.conditionBox'),
                $firstConBox = $curConditionBox.prev('.conditionBox'),
                subjectKey = $firstConBox.find('select option:selected').attr('data-key'),
                operateKey = $elem.find('option:selected').attr('data-key');

            // 免租期-介于
            if(subjectKey == 'freeLease') {
                if(data.value == '41') {
                    $curConditionBox.nextAll().remove();
                    $curConditionBox.after(getFreeLeaseHtml(2));
                } else {
                    $curConditionBox.nextAll().remove();
                    $curConditionBox.after(getFreeLeaseHtml(1));
                }
                form.render();
            }
        });
    });
});