/**
 * 设置-条件审批流程(编辑)
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
    var nodeTosHtml;

    function init() {
        nodeTosHtml = $('.nodeTos').html();
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
                        actualSave(function (res) {
                            if(res.status) {
                                updateNodeTosHtml();
                            } else {
                                resetNodeTos();
                            }
                        });
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

    function updateNodeTosHtml() {
        nodeTosHtml = $('.nodeTos').html();
    }

    function resetNodeTos() {
        $('.nodeTos').html(nodeTosHtml);
    }

    // 实时保存
    function actualSave(cb) {
        var submitUrl = $('#saveSubmit').val();
        var $form = $('.flowForm');
        Common.Util.replaceSerializeName2($form);
        var param = $form.serializeArray();

        Req.postReq(submitUrl, param, function (res) {
            if (res.status) {
                Dialog.successDialog(res.msg);
            } else {
                Dialog.errorDialog(res.msg);
            }
            cb && cb(res);
        });
    }

    $(function() {
        init();

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

        $(document).on('click', '.del', function(e) {
            e.preventDefault();
            var $flowStep = $(this).parents('.flow-step'),
                $arrow = $flowStep.next();

            $flowStep.remove();
            $arrow.remove();
            actualSave(function(res) {
                if(res.status) {
                    updateNodeTosHtml();
                } else {
                    resetNodeTos();
                }
            });
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
                        actualSave();
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
            actualSave();
        });

        /**
         * 条件审批流程
         */
        // 删除
        $(document).on('click', '.conditionDel', function(e) {
            e.preventDefault();
            var $o = $(this),
                url = $o.attr('data-url'),
                $wrap = $o.parents('.ibs-collapse');

            Req.getReq(url, function (res) {
                if(res.status) {
                    Dialog.successDialog(res.msg, function () {
                        // $wrap.remove();
                        window.location.reload();
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            })
        });

        // 添加
        $(document).on('click', '.conditionAdd', function(e) {
            e.preventDefault();
            var $o = $(this),
                url = $o.attr('data-url');
            var $editFlows = $('.editFlow');

            if($editFlows.length) {
                window.location.href = url;
            } else {
                Dialog.errorDialog("请先设置默认审批流程，然后才可以添加条件审批流程");
            }
        });

        // 编辑
        $(document).on('click', '.conditionEdit', function(e) {
            e.preventDefault();
            var $o = $(this),
                url = $o.attr('data-url');
            window.location.href = url;
        });

        // 上移
        $(document).on('click', '.conditionUp', function(e) {
            e.preventDefault();
            var $o = $(this),
                url = $o.attr('data-url');
            var $curCollapse = $o.parents('.ibs-collapse'),
                $prev = $curCollapse.prev();

            Req.getReq(url, function (res) {
                if(res.status) {
                    // $prev.before($curCollapse);
                    window.location.reload();
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 下移
        $(document).on('click', '.conditionDown', function(e) {
            e.preventDefault();
            var $o = $(this),
                url = $o.attr('data-url');
            var $curCollapse = $o.parents('.ibs-collapse'),
                $next = $curCollapse.next();

            Req.getReq(url, function (res) {
                if(res.status) {
                    // $next.after($curCollapse);
                    window.location.reload();
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        form.on('radio(triggerType)', function (data) {

            actualSave();
        })
    });
});