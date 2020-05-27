/**
 * 组织架构树形结构(企业微信)
 */
layui.define(function(exports){
    var $ = layui.jquery;


    function Tree(_config) {
        this.init(_config);
        this.eventHandle();
    }

    Tree.prototype = {
        constructor: Tree,
        // 配置扩展参数
        defaults: {
            // 弹框标题
            title: '选择人员',
            // 选择操作类型(单选：false, 多选：true)
            type: true,
            // 当选择左侧人员个数为0时，【确认】按钮默认disabled；当设置为true时，不受此限制
            isConfirmBtnShow: false,
            // 输入框提示语
            searchPlaceHolder: '搜索成员或部门',
            // 区分PC、笔记本
            _height: 800
        },

        init: function(_config) {
            this.config = $.extend({}, this.defaults, _config);
            this.uidArr = [];           // 员工Id
            this.uidTextArr = [];       // 员工姓名
            this.mobileArr = [];          // 手机号码
            this.treeViewArr = [];
            this.searchViewArr = [];

            this.render(_config.data);
        },

        render: function(data) {
            var treeHeadHtml,
                treeMidHtml,
                treeBotHtml;

            // 可见区域高度
            var pageHeight = document.documentElement.clientHeight;
            if(pageHeight > this.config._height) {
                // PC
                this.$tree = $('<div class="dp-tree-mask"><div class="dp-tree-wrap"></div></div>');
            } else {
                // 笔记本
                this.$tree = $('<div class="dp-tree-mask adapt"><div class="dp-tree-wrap"></div></div>');
            }

            treeHeadHtml = '<div class="dp-tree-head">' +
                '<div class="dp-tree-title">'+ this.config.title +'</div>' +
                '<div class="dp-tree-close"></div>' +
                '</div>';
            treeMidHtml = '<div class="dp-tree-middle">' +
                                '<div class="dp-tree-struct-wrap">' +
                                    '<div class="dp-tree-search">' +
                                        '<input type="text" class="dp-tree-search-input" placeholder="'+ this.config.searchPlaceHolder +'">' +
                                        '<span class="dp-tree-search-icon"></span>' +
                                        '<div class="dp-treeResultWrap">' +
                                            '<ul class="dp-tree-search-result">' +

                                            '</ul>' +
                                        '</div>' +
                                    '</div>' +
                                    '<ul class="dp-tree-struct">'+
                                        this.getStructHtml(data) +
                                    '</ul>' +
                                '</div>' +
                                '<div class="dp-tree-view-wrap">' +
                                    '<div class="dp-tree-view-title">已选择了<span id="selectedCount">0</span>个成员</div>' +
                                    '<div class="dp-treeViewWrap">'+
                                        '<div class="dp-tree-view">' +

                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';
            treeBotHtml = '<div class="dp-tree-bottom">' +
                '<div class="dp-tree-btn dp-tree-btn-cancel">取&nbsp;&nbsp;消</div>';

            if(this.config.isConfirmBtnShow) {
                treeBotHtml += '<div class="dp-tree-btn dp-tree-btn-confirm">确&nbsp;&nbsp;定</div>';
            } else {
                treeBotHtml += '<div class="dp-tree-btn dp-tree-btn-confirm disabled">确&nbsp;&nbsp;定</div>';
            }
            treeBotHtml += '</div>';

            this.$tree.find('.dp-tree-wrap').append(treeHeadHtml);
            this.$tree.find('.dp-tree-wrap').append(treeMidHtml);
            this.$tree.find('.dp-tree-wrap').append(treeBotHtml);

            $('body').append(this.$tree);

            // 展开到第二级
            var $secondLevel = $('.dp-tree-struct').children('li');
            $secondLevel.each(function(index, o) {
                if($(o).hasClass('hasChildren')) {
                    $(o).removeClass();
                    $(o).addClass('hasChildren collapsable');
                    $(o).children('ul').show();
                }
            })
            // $('.dp-tree-wrap .dp-tree-struct').mCustomScrollbar({ theme: "minimal" });
            // $('.dp-tree-wrap .dp-treeViewWrap').mCustomScrollbar({ theme: "minimal" });
            // $('.dp-tree-wrap .dp-treeResultWrap').mCustomScrollbar({ theme: "minimal" });

            this.$tree.show();
            // 防止系统弹框跟本属性结构层级重叠
            if(this.config.zIndex) {
                this.$tree.css('z-index', this.config.zIndex);
            }
            var that = this;
            if(this.config.edit && Array.isArray(this.config.edit)) {
                // 添加完后编辑
                setTimeout(function() {
                    that.edit(that.config.edit);
                },0)

            }
        },

        // 当前部门节点下是否存在员工（选择按钮显示用）
        hasEmployee: function(curDept) {
            var userList = curDept.userList == null ? [] : curDept.userList,
                deptList = curDept.deptList == null ? [] : curDept.deptList;

            if(userList.length) {
                return true;
            } else {
                for(var i = 0, len = deptList.length; i < len; i++) {
                    var flag = this.hasEmployee(deptList[i]);
                    if(flag) {
                        return true;
                    }
                }
            }
            return false;
        },

        getStructHtml: function(list) {
            list = list == null ? [] : list;
            var _html = '';
            for(var i = 0, len = list.length; i < len; i++) {
                var curO = list[i],
                    curDeptList = curO.deptList == null ? [] : curO.deptList,
                    curUserList = curO.userList == null ? [] : curO.userList;


                // 当前节点是否有子节点
                if(curDeptList.length || curUserList.length) {
                    _html += '<li class="hasChildren expandable" type="branch" did="'+ curO.id +'" hasselectbtn="'+ this.hasEmployee(curO) +'">' +
                                '<div class="dp-tree-struct-item" type="branch">' +
                                    curO.name +
                                    '<span class="dp-tree-icon-depart"></span>';
                    if(this.config.type && this.hasEmployee(curO)) {
                        _html += '<span class="dp-tree-icon-select branch" did="'+ curO.id +'" data-name="'+ curO.name +'"></span>';
                    }
                    _html +=

                                '</div>' +
                                '<ul style="display: none;">' +
                                    this.getEmpHtml(curUserList) +
                                    this.getStructHtml(curO.deptList) +
                                '</ul>' +
                              '</li>';
                } else {
                    _html += '<li did="'+ curO.id +'">' +
                                '<div class="dp-tree-struct-item">'+
                                    curO.name +
                                    '<span class="dp-tree-icon-depart"></span>' +
                                '</div>' +
                             '</li>';
                }
            }
            return _html;
        },

        // 成员列表
        getEmpHtml: function(userList) {
            userList = userList == null ? [] : userList;
            var _html = '';
            userList.forEach(function(item, index) {
                _html += '<li type="leaf" did="'+ item.department +'" userid="'+ item.userid +'" mobile="'+ item.mobile +'">' +
                            '<div class="dp-tree-struct-item" type="leaf" did="'+ item.department +'" userid="'+ item.userid +'" mobile="'+ item.mobile +'">' +
                                item.name;
                if(item.avatar) {
                    _html += '<img class="dp-tree-icon-user" src="'+ item.avatar +'" alt="'+ item.name +'">';
                } else {
                    _html += '<span class="dp-tree-icon-default-user"></span>';
                }
                _html +=     '<span class="dp-tree-icon-select leaf" data-name="'+ item.name +'" did="'+ item.department +'" userid="'+ item.userid +'" mobile="'+ item.mobile +'"></span>' +
                            '</div>' +
                         '</li>';
            });
            return _html;
        },

        eventCenter: {
            // 关闭、取消
            close: function() {
                this.removeEventListener();
                this.$tree.remove();
            },
            // 确定
            confirm: function(e) {
                if($(e.target).hasClass('disabled')) return false;
                this.config.callback(this);
            },
            // 展开、收缩
            toggle: function(e) {
                e.stopPropagation();
                var $o;
                if($(e.target).hasClass('leaf')) return false;

                if($(e.target).hasClass('dp-tree-struct-item')) {
                    $o = $(e.target).parent();
                } else {
                    $o = $(e.target);
                }

                if($o.hasClass('expandable')) {
                    $o.attr('class', 'hasChildren collapsable');
                    $o.children('ul').slideDown();
                } else if($o.hasClass('collapsable')){
                    $o.attr('class', 'hasChildren expandable');
                    $o.children('ul').slideUp();
                }
            },
            // 左侧添加或删除
            doLeft: function(e) {
                e.stopPropagation();
                if($(e.target).hasClass('dp-tree-struct-item')) {
                    this.handle($(e.target).find('.dp-tree-icon-select.leaf'));
                } else {
                    this.handle($(e.target));
                }
                $('.dp-tree-wrap .dp-treeResultWrap').hide();
            },
            // 删除
            deleteFix: function(e) {
                var mobile = $(this).attr('mobile');
                // 某个成员有可能存在于多个事业部或项目中(只需触发其中一个即可)
                $('.dp-tree-wrap .dp-tree-icon-select.leaf[mobile='+ mobile +']').eq(0).trigger('click');
            },
            // 搜索
            search: function(e) {
                var keyword = $(e.target).val();
                if($.trim(keyword) == '') {
                    $('.dp-tree-wrap .dp-tree-search-result').html('');
                    $('.dp-tree-wrap .dp-treeResultWrap').hide();
                    return;
                } else {
                    this.search(keyword);
                }
            },
            focus: function() {
                if($('.dp-tree-wrap .dp-tree-search-result').find('li').length) {
                    $('.dp-tree-wrap .dp-treeResultWrap').show();
                }
            },
            searchItemClick: function(e) {
                e.stopPropagation();
                this.appendItem($(e.target));
                $('.dp-tree-wrap .dp-treeResultWrap').hide();
            }
        },

        removeEventListener: function() {
            $(document).off('click', '.dp-tree-wrap .dp-tree-close, .dp-tree-wrap .dp-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, this));
            $(document).off('click', '.dp-tree-wrap .dp-tree-btn-confirm', jQuery.proxy( this.eventCenter.confirm, this));
            $(document).off('click', '.dp-tree-wrap .hasChildren', this.eventCenter.toggle);
            $(document).off('click', '.dp-tree-wrap .dp-tree-icon-select, .dp-tree-wrap .dp-tree-struct-item[type=leaf]', jQuery.proxy( this.eventCenter.doLeft, this));
            $(document).off('click', '.dp-tree-wrap .dp-tree-icon-close', this.eventCenter.deleteFix);
            $(document).off('propertychange input', '.dp-tree-wrap .dp-tree-search-input', jQuery.proxy( this.eventCenter.search, this));
            $(document).off('focus', '.dp-tree-wrap .dp-tree-search-input', this.eventCenter.focus);
            $(document).off('click', '.dp-tree-wrap .dp-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,this));
        },
        // 事件处理
        eventHandle: function() {
            var _this = this;

            // 关闭、取消
            $(document).on('click', '.dp-tree-wrap .dp-tree-close, .dp-tree-wrap .dp-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, _this));

            // 确定
            $(document).on('click', '.dp-tree-wrap .dp-tree-btn-confirm', jQuery.proxy( this.eventCenter.confirm, _this));

            // 展开、关闭
            $(document).on('click', '.dp-tree-wrap .hasChildren', this.eventCenter.toggle);

            // 左侧选择
            $(document).on('click', '.dp-tree-wrap .dp-tree-icon-select, .dp-tree-wrap .dp-tree-struct-item[type=leaf]', jQuery.proxy( this.eventCenter.doLeft, _this));

            // 删除
            $(document).on('click', '.dp-tree-wrap .dp-tree-icon-close', this.eventCenter.deleteFix);

            // 搜索
            $(document).on('propertychange input', '.dp-tree-wrap .dp-tree-search-input', jQuery.proxy( this.eventCenter.search, _this));
            $(document).on('focus', '.dp-tree-wrap .dp-tree-search-input', this.eventCenter.focus);
            $(document).on('click', function() {
                $('.dp-tree-wrap .dp-tree-search-input').blur();
                $('.dp-tree-wrap .dp-treeResultWrap').hide();
            });
            $(document).on('click', '.dp-tree-wrap .dp-tree-search', function(e) {
                e.stopPropagation();
            });
            $(document).on('click', '.dp-tree-wrap .dp-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,_this));
        },

        handle: function($target) {
            if($target.hasClass('active')) {
                // 已选中
                this.appendOrRemoveItem($target, 'remove');
            } else {
                // 未选中
                this.appendOrRemoveItem($target, 'append');
            }
            this.updateTreeView();
        },

        appendOrRemoveItem: function($node, type) {
            if($node.hasClass('branch')) {
                this.appendOrRemoveBranch($node, type);
            } else {
                this.statusHandle($node, type);
                this.dataHandle($node, type);
            }
        },

        getSelectHtml: function($node) {
            return $node.parent().parent().html();
        },

        /**
         * 数据处理
         * @param $node
         * @param type append或remove
         */
        dataHandle: function($node, type) {
            var userid = $node.attr('userid'),
                uidText = $node.attr('data-name'),
                mobile = $node.attr('mobile');
            if(type == 'append') {
                if(!this.config.type) {
                    // 单选
                    this.reset();
                }
                if(this.uidArr.indexOf(userid) == -1) {
                    this.uidArr.push(userid);
                    this.mobileArr.push(mobile);
                    this.uidTextArr.push(uidText);
                    this.treeViewArr.push(this.getSelectHtml($node));
                }
            } else if(type == 'remove') {
                var index = this.uidArr.indexOf(userid);
                if(index != -1) {
                    this.uidArr.splice(index,1);
                    this.mobileArr.splice(index, 1);
                    this.uidTextArr.splice(index,1);
                    this.treeViewArr.splice(index, 1);
                }
            }
        },

        /**
         * 选中状态处理
         * @param $node
         * @param type append或remove
         */
        statusHandle: function($node, type) {
            // var userid = $node.attr('userid');
            var mobile = $node.attr('mobile');
            if(type == 'append') {
                if(!this.config.type) {
                    // 单选
                    $('.dp-tree-wrap .dp-tree-icon-select').removeClass('active');
                    $('.dp-tree-wrap .dp-tree-icon-select[mobile='+ mobile +']').addClass('active');
                } else {
                    // 多选
                    $('.dp-tree-wrap .dp-tree-icon-select[mobile='+ mobile +']').addClass('active');
                }
            } else if(type == 'remove') {
                $('.dp-tree-wrap .dp-tree-icon-select[mobile='+ mobile +']').removeClass('active');
            }
            this.updateStyle();
        },

        /**
         * Branch添加或移除
         * @param $node
         * @param type append或remove
         */
        appendOrRemoveBranch: function($node, type) {
            var _this = this,
                $parentLi = $node.parent().parent(),
                $notSelectLeafs = $parentLi.find('.dp-tree-icon-select.leaf:not(.active)'),
                $selectLeafs = $parentLi.find('.dp-tree-icon-select.leaf.active');

            if(type == 'append') {
                $parentLi.find('.dp-tree-icon-select.branch').addClass('active');
                $notSelectLeafs.each(function(i,o) {
                    _this.statusHandle($(o), type);
                    _this.dataHandle($(o), type);
                });
            } else if(type == 'remove') {
                $parentLi.find('.dp-tree-icon-select.branch').removeClass('active');
                $selectLeafs.each(function(i,o) {
                    _this.statusHandle($(o), type);
                    _this.dataHandle($(o), type);
                });
            }
        },

        // 更新左侧选中样式
        updateStyle: function() {
            var $level2Lis = $('.dp-tree-struct').children('li[type=branch][hasselectbtn=true]'),
                _this = this;

            $level2Lis.each(function(index, obj) {
                _this.updateSelectStatus($(obj));
            });
        },

        updateSelectStatus: function($target) {
            var _this = this;
            var $curAllLeafs = $target.find('.dp-tree-icon-select.leaf'), // 当前分支下的所有可选叶子节点
                $curSelectedLeafs = $target.find('.dp-tree-icon-select.leaf.active'); // 当前分支下的选中的叶子节点

            if($curAllLeafs.length == $curSelectedLeafs.length) {
                $target.children('div').find('.dp-tree-icon-select.branch').addClass('active');
            } else {
                $target.children('div').find('.dp-tree-icon-select.branch').removeClass('active');
            }

            var $filterLiNodes = $target.children('ul').children('li[type=branch][hasselectbtn=true]');


            if($filterLiNodes.length) {
                $filterLiNodes.each(function(index, obj) {
                    _this.updateSelectStatus($(obj));
                });
            }
        },

        // 更新右侧内容
        updateTreeView: function() {
            var _html = '';

            _html = this.treeViewArr.join('');
            _html = _html.replace(/dp-tree-icon-select/g, 'dp-tree-icon-close');
            $('.dp-tree-view').html(_html);
            $('.dp-tree-wrap #selectedCount').text(this.uidArr.length);
            // 【确认】按钮是否可点击


            if(this.config.isConfirmBtnShow) {
                $('.dp-tree-wrap .dp-tree-btn-confirm').removeClass('disabled');
            } else {
                if(this.uidArr.length == 0) {
                    $('.dp-tree-wrap .dp-tree-btn-confirm').addClass('disabled');
                } else {
                    $('.dp-tree-wrap .dp-tree-btn-confirm').removeClass('disabled');
                }
            }
        },

        reset: function() {
            this.uidArr.length = 0;
            this.mobileArr.length = 0;
            this.uidTextArr.length = 0;
            this.treeViewArr.length = 0;
        },

        edit: function(editArr) {
            for(var i = 0, len = editArr.length; i < len; i++) {
                // var userid = editArr[i];
                var mobile = editArr[i];
                $('.dp-tree-wrap .dp-tree-icon-select.leaf[mobile='+ mobile +']').eq(0).trigger('click');
            }
        },

        // 搜索成员或部门
        search: function(keyword) {

            $('.dp-tree-wrap .dp-tree-search-result').html('');
            this.searchViewArr.length = 0;

            this.searchUser(keyword);
            this.searchDepart(keyword);

            if(this.searchViewArr.length) {
                $('.dp-tree-wrap .dp-tree-search-result').html(this.searchViewArr.join(''));
                $('.dp-tree-wrap .dp-tree-search-result').find('li[type=branch]').removeClass().addClass('hasChildren expandable');
                $('.dp-tree-wrap .dp-tree-search-result').find('ul').hide();
            } else {
                $('.dp-tree-wrap .dp-tree-search-result').html('<li>没有匹配结果!</li>');
            }

            $('.dp-tree-wrap .dp-treeResultWrap').show();
        },

        // 搜索成员
        searchUser: function(keyword) {
            var uidsArr = [],
                leafHtmlArr = [];
            var $treeStructItems = $('.dp-tree-wrap .dp-tree-struct-item[type=leaf]');

            $treeStructItems.each(function(i, o) {
                var txt = $(o).text();
                if(txt.indexOf(keyword) !== -1) {
                    var userid = $(o).attr('userid');
                    if(uidsArr.indexOf(userid) == -1) {
                        // 员工可能存在于多部门
                        uidsArr.push(userid);
                        leafHtmlArr.push($(o).parent().prop('outerHTML'));
                    }
                }
            });
            this.searchViewArr = leafHtmlArr;
        },

        // 搜索部门
        searchDepart: function(keyword) {
            var $topDeparts = $('.dp-tree-struct').children('li[type=branch]'),
                _this = this;

            $topDeparts.each(function(i,o) {
                _this.searchDepartHandle($(o), keyword);
            });
        },

        searchDepartHandle: function($o, keyword) {
            var _this = this,
                dName = $o.children('.dp-tree-struct-item').text(),
                $childDeparts = $o.children('ul').children('li[type=branch]');

            if(dName.indexOf(keyword) != -1) {
                this.searchViewArr.push($o.prop('outerHTML'));
            } else {
                if($childDeparts.length) {
                    $childDeparts.each(function(i,o) {
                        _this.searchDepartHandle($(o), keyword)
                    });
                }
            }
        },

        close: function() {
            this.$tree.remove();
        },

        hide: function() {
            this.$tree.hide();
        },
    };

    function init(option) {
        return new Tree(option);
    }
    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('CWTree', init);
});