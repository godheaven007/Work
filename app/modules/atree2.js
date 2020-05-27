/**
 * description: 火炬服务（地区选择）
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
            title: '选择地区',
            // 当选择左侧个数为0时，【确认】按钮默认disabled；当设置为true时，不受此限制
            isConfirmBtnShow: false,
            // 输入框提示语
            searchPlaceHolder: '搜索地区或项目',
            // 默认显示
            isShow: true,
            // 回调函数立即调用
            isInvokeImmediate: false
        },

        init: function(_config) {
            this.config = $.extend({}, this.defaults, _config);
            this.areaIdArr = [];           // 区域或项目Id（全国：country_1, 省份：province_xxx, 市: city_xxx, 区：district_xxx,项目: park_xxx或base_xxx）
            this.areaNameArr = [];         // 区域或项目名称
            this.treeViewArr = [];
            this.searchViewArr = [];

            this.render(_config.data);
        },

        // dom渲染
        render: function(data) {
            var treeHeadHtml,
                treeMidHtml,
                treeBotHtml;
            this.$tree = $('<div class="area-tree-mask"><div class="area-tree-wrap"></div></div>');

            treeHeadHtml = '<div class="area-tree-head">' +
                '<div class="area-tree-title">'+ this.config.title +'</div>' +
                '<div class="area-tree-close"></div>' +
                '</div>';
            treeMidHtml = '<div class="area-tree-middle">' +
                '<div class="area-tree-struct-wrap">' +
                '<div class="area-tree-search">' +
                '<input type="text" class="area-tree-search-input" placeholder="'+ this.config.searchPlaceHolder +'">' +
                '<span class="area-tree-search-icon"></span>' +
                '<div class="area-treeResultWrap">' +
                '<ul class="area-tree-search-result">' +

                '</ul>' +
                '</div>' +
                '</div>' +
                '<ul class="area-tree-struct">'+
                '<li class="hasChildren collapsable" level="level0" type="branch" areaId="country_1" areaName="全国">' +
                '<div class="area-tree-struct-item branch" areaid="country_1" areaName="全国" title="全国">' +
                '全国' +
                '<span class="area-tree-icon-select" areaid="country_1"></span>' +
                '<span class="area-tree-icon-1"></span>' +
                '</div>' +
                '<ul>' +
                this.getTreeNodes(data) +
                '</ul>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '<div class="area-tree-view-wrap">' +
                '<div class="area-tree-view-title">已选择的地区或项目</div>' +
                '<div class="area-treeViewWrap">'+
                '<ul class="area-tree-view">' +

                '</ul>' +
                '</div>' +
                '</div>' +
                '</div>';
            treeBotHtml = '<div class="area-tree-bottom">' +
                '<div class="area-tree-btn area-tree-btn-cancel">取&nbsp;&nbsp;消</div>' +
                '<div class="area-tree-btn area-tree-btn-confirm disabled">确&nbsp;&nbsp;定</div>' +
                '</div>';

            this.$tree.find('.area-tree-wrap').append(treeHeadHtml);
            this.$tree.find('.area-tree-wrap').append(treeMidHtml);
            this.$tree.find('.area-tree-wrap').append(treeBotHtml);

            $('body').append(this.$tree);
            // $('.area-tree-wrap .area-tree-struct').mCustomScrollbar({ theme: "minimal" });
            // $('.area-tree-wrap .area-treeViewWrap').mCustomScrollbar({ theme: "minimal" });
            // $('.area-tree-wrap .area-treeResultWrap').mCustomScrollbar({ theme: "minimal" });

            if(this.config.isShow) {
                this.$tree.show();
            } else {
                this.$tree.hide();
            }

            var _this = this;
            if(this.config.edit && Array.isArray(this.config.edit)) {
                // 添加完后编辑
                setTimeout(function() {
                    _this.edit(_this.config.edit);
                    if(_this.config.isInvokeImmediate) {
                        _this.config.callback(_this);
                    }
                },0)
            }
        },

        // 获取树形结构节点
        getTreeNodes: function(data) {
            var regionList = data.region,
                projectList = data.project,
                html = '';
            if(!Array.isArray(regionList) || !regionList.length) {
                throw new Error('请检查区域数据!');
                return false;
            }

            if(!Object.keys(projectList).length) {
                throw new Error('项目数据不存在!');
                return false;
            }

            // 省
            for(var i = 0, len = regionList.length; i < len; i++) {
                html += '<li class="hasChildren expandable" level="level1" type="branch" areaId="'+ 'province_' + regionList[i].linkageid +'" areaName="'+ regionList[i].name +'">' +
                    '<div class="area-tree-struct-item branch" areaId="'+ 'province_' + regionList[i].linkageid +'" areaName="'+ regionList[i].name +'" title="'+ regionList[i].name +'">' +
                    regionList[i].name +
                    '<span class="area-tree-icon-select" areaId="'+ 'province_' + regionList[i].linkageid +'"></span>' +
                    '<span class="area-tree-icon-1"></span>' +
                    '</div>' +
                    '<ul style="display: none;">' +
                    getCityHtml(regionList[i].cityList) +
                    '</ul>' +
                    '</li>';
            }

            // 市
            function getCityHtml(cityList) {
                var tempHtml = '';
                for(var i = 0, len = cityList.length; i < len; i++) {
                    tempHtml += '<li class="hasChildren expandable" type="branch" level="level2" areaId="'+ 'city_' + cityList[i].linkageid +'" areaName="'+ cityList[i].name +'">' +
                        '<div class="area-tree-struct-item branch" areaId="'+ 'city_' + cityList[i].linkageid +'" areaName="'+ cityList[i].name +'" title="'+ cityList[i].name +'">' +
                        cityList[i].name +
                        '<span class="area-tree-icon-select" areaId="'+ 'city_' + cityList[i].linkageid +'"></span>' +
                        '<span class="area-tree-icon-1"></span>' +
                        '</div>' +
                        '<ul style="display: none;">' +
                        getDistrictHtml(cityList[i].areaList) +
                        '</ul>' +
                        '</li>';
                }
                return tempHtml;
            }

            // 区
            function getDistrictHtml(areaList) {
                var tempHtml = '';
                for(var i = 0, len = areaList.length; i < len; i++) {
                    if(curDistrictHasProject(areaList[i].linkageid)) {
                        tempHtml += '<li class="hasChildren expandable" type="branch" level="level3" areaId="'+ 'district_' + areaList[i].linkageid +'" areaName="'+ areaList[i].name +'">' +
                            '<div class="area-tree-struct-item branch" areaId="'+ 'district_' + areaList[i].linkageid +'" areaName="'+ areaList[i].name +'" title="'+ areaList[i].name +'">' +
                            areaList[i].name +
                            '<span class="area-tree-icon-select" areaId="'+ 'district_' + areaList[i].linkageid +'"></span>' +
                            '<span class="area-tree-icon-1"></span>' +
                            '</div>' +
                            '<ul style="display: none;">' +
                            getProjectHtml(areaList[i].linkageid) +
                            '</ul>' +
                            '</li>';
                    } else {
                        tempHtml += '<li level="level3" type="branch" areaId="'+ 'district_' + areaList[i].linkageid +'" areaName="'+ areaList[i].name +'">' +
                            '<div class="area-tree-struct-item branch" areaId="'+ 'district_' + areaList[i].linkageid +'" areaName="'+ areaList[i].name +'" title="'+ areaList[i].name +'">' +
                            areaList[i].name +
                            '<span class="area-tree-icon-select" areaId="'+ 'district_' + areaList[i].linkageid +'"></span>' +
                            '<span class="area-tree-icon-1"></span>' +
                            '</div>' +
                            '</li>';
                    }
                }
                return tempHtml;
            }

            // 当前园区下是否有项目
            function curDistrictHasProject(districtId) {
                for(var key in projectList) {
                    if(key == districtId) {
                        return 1;
                    }
                }
                return 0;
            }

            // 项目
            function renderProject(list) {
                var tempHtml = '';
                for(var i = 0, len = list.length; i < len; i++) {
                    tempHtml += '<li level="level4" type="leaf" areaId="'+ list[i].targetType + '_' + list[i].targetId +'" areaName="'+ list[i].targetName +'">' +
                        '<div class="area-tree-struct-item leaf" areaId="'+ list[i].targetType + '_' + list[i].targetId +'" areaName="'+ list[i].targetName +'" title="'+ list[i].targetName +'">' +
                        list[i].targetName +
                        '<span class="area-tree-icon-select" areaId="'+ list[i].targetType + '_' + list[i].targetId +'"></span>' +
                        '<span class="area-tree-icon-2"></span>' +
                        '</div>' +
                        '</li>';
                }
                return tempHtml;
            }

            function getProjectHtml(districtId) {
                var tempHtml  = '';
                for(var key in projectList) {
                    if(key == districtId) {
                        tempHtml = renderProject(projectList[key]);
                        break;
                    }
                }
                return tempHtml;
            }
            return html;
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
                var $target = $(this);
                if(e.target == this) {
                    if($target.hasClass('expandable')) {
                        $target.attr('class', 'hasChildren collapsable');
                        $target.children('ul').slideDown();
                    } else {
                        $target.attr('class', 'hasChildren expandable');
                        $target.children('ul').slideUp();
                    }
                }
            },

            // 左侧添加或删除
            doLeft: function(e) {
                e.stopPropagation();
                var $target = $(e.target);
                var $topParent = $target.parents('.area-tree-search-result');

                if($target.hasClass('area-tree-struct-item') && $target.hasClass('branch')) {
                    // 展开或关闭（没有选中功能）
                    var $parent = $target.parent();
                    if($parent.hasClass('hasChildren')) {
                        if($parent.hasClass('expandable')) {
                            $parent.attr('class', 'hasChildren collapsable');
                            $parent.children('ul').slideDown();
                        } else {
                            $parent.attr('class', 'hasChildren expandable');
                            $parent.children('ul').slideUp();
                        }
                    } else {
                        this.handle($target);
                    }
                } else if($target.hasClass('area-tree-struct-item') && $target.hasClass('leaf')){
                    this.handle($target);
                } else {
                    // area-tree-icon-select
                    this.handle($target.parent());
                }

                // 搜索-点击分支展开，不需要关闭；
                // if($topParent.length) {
                //     $('.area-tree-wrap .area-treeResultWrap').hide();
                // }
            },

            // 右侧删除
            delete: function(e) {
                var areaId = $(this).attr('areaid');
                $('.area-tree-wrap .area-tree-icon-select[areaid="'+ areaId +'"]').eq(0).trigger('click');
            },

            // 搜索
            search: function(e) {
                var keyword = $(e.target).val();
                if($.trim(keyword) == '') {
                    $('.area-tree-wrap .area-tree-search-result').html('');
                    $('.area-tree-wrap .area-treeResultWrap').hide();
                    return;
                } else {
                    this.search(keyword);
                }
            },
            focus: function() {
                if($('.area-tree-wrap .area-tree-search-result').find('li').length) {
                    $('.area-tree-wrap .area-treeResultWrap').show();
                }
            },
            searchItemClick: function(e) {
                e.stopPropagation();
                this.appendItem($(e.target));
                $('.area-tree-wrap .area-treeResultWrap').hide();
            }
        },

        removeEventListener: function() {
            $(document).off('click', '.area-tree-wrap .area-tree-close, .area-tree-wrap .area-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, this));
            $(document).off('click', '.area-tree-wrap .area-tree-btn-confirm', jQuery.proxy( this.eventCenter.confirm, this));
            $(document).off('click', '.area-tree-wrap .hasChildren', this.eventCenter.toggle);
            $(document).off('click', '.area-tree-wrap .area-tree-icon-select, .area-tree-wrap .area-tree-struct-item', jQuery.proxy( this.eventCenter.doLeft, this));
            $(document).off('click', '.area-tree-wrap .area-tree-view-item-close', this.eventCenter.delete);

            $(document).off('propertychange input', '.area-tree-wrap .area-tree-search-input', jQuery.proxy( this.eventCenter.search, this));
            $(document).off('focus', '.area-tree-wrap .area-tree-search-input', this.eventCenter.focus);
            $(document).off('click', '.area-tree-wrap .area-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,this));
        },

        // 事件处理
        eventHandle: function() {
            var _this = this;

            /****************************************************************************************************/
            // 关闭、取消
            $(document).on('click', '.area-tree-wrap .area-tree-close, .area-tree-wrap .area-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, _this));

            // 确定
            $(document).on('click', '.area-tree-wrap .area-tree-btn-confirm', jQuery.proxy(this.eventCenter.confirm, _this));

            // 展开、合并
            $(document).on('click', '.area-tree-wrap .hasChildren', this.eventCenter.toggle);

            // 左侧选择
            $(document).on('click', '.area-tree-wrap .area-tree-icon-select, .area-tree-wrap .area-tree-struct-item', jQuery.proxy(this.eventCenter.doLeft, _this));

            // 删除
            $(document).on('click', '.area-tree-wrap .area-tree-view-item-close', this.eventCenter.delete);

            // 搜索
            $(document).on('propertychange input focus', '.area-tree-wrap .area-tree-search-input', jQuery.proxy( this.eventCenter.search, _this));
            $(document).on('click', function() {
                $('.area-tree-wrap .area-tree-search-input').blur();
                $('.area-treeResultWrap').hide();
            });
            $(document).on('click', '.area-tree-wrap .area-tree-search', function(e) {
                e.stopPropagation();
            });
            $(document).on('click', '.area-tree-wrap .area-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,_this));
            /****************************************************************************************************/
        },

        handle: function($target) {
            if($target.hasClass('active')) {
                // 已选中
                this.removeItem($target);
            } else {
                // 未选中
                this.appendItem($target);
            }
            $('.area-tree-wrap .area-treeResultWrap').hide();
            this.updateTreeView();
        },

        // 添加
        appendItem: function($target) {
            var areaId = $target.attr('areaid');
            $('.area-tree-wrap .area-tree-struct-item[areaid='+ areaId +']').addClass('active');
        },

        // 删除
        removeItem: function($target) {
            var areaId = $target.attr('areaid');
            $('.area-tree-wrap .area-tree-struct-item[areaid='+ areaId +']').removeClass('active');
        },

        getData: function() {
            var _this = this;
            this.areaIdArr.length = 0;
            this.areaNameArr.length = 0;

            var $areaTreeViewItemClose = $('.area-tree-view .area-tree-view-item-close');
            $areaTreeViewItemClose.each(function(i,o) {
                var $o = $(o),
                    areaId = $o.attr('areaid'),
                    areaName = $o.attr('areaname');
                _this.areaIdArr.push(areaId);
                _this.areaNameArr.push(areaName);
            });
        },

        updateTreeView: function() {
            var html = '';
            var $activeItemLeafs = $('.area-tree-wrap .area-tree-struct .area-tree-struct-item.active');

            $activeItemLeafs.each(function(i, o) {
                var areaId = $(o).attr('areaid'),
                    areaName = $(o).attr('areaname');
                if($(o).hasClass('branch')) {
                    html += '<li class="area-tree-view-item" title="'+ areaName +'">' +
                        '<span class="area-tree-view-branch"></span>' +
                        areaName +
                        '<span class="area-tree-view-item-close" areaId="'+ areaId +'" areaName="'+ areaName +'"></span>' +
                        '</li>';
                } else {
                    html += '<li class="area-tree-view-item leaf" title="'+ areaName +'">' +
                        '<span class="area-tree-view-leaf"></span>' +
                        areaName +
                        '<span class="area-tree-view-item-close" areaId="'+ areaId +'" areaName="'+ areaName +'"></span>' +
                        '</li>';
                }
            });

            $('.area-tree-wrap .area-tree-view').html(html);

            this.getData();
            if(this.areaIdArr.length == 0) {
                $('.area-tree-wrap .area-tree-btn-confirm').addClass('disabled');
            } else {
                $('.area-tree-wrap .area-tree-btn-confirm').removeClass('disabled');
            }
        },

        edit: function(editArr) {
            for(var i = 0, len = editArr.length; i < len; i++) {
                var areaId = editArr[i];
                $('.area-tree-wrap .area-tree-icon-select[areaid="'+ areaId +'"]').eq(0).trigger('click');
            }
        },

        // 搜索地区或项目
        search: function(keyword) {
            $('.area-tree-wrap .area-tree-search-result').html('');
            this.searchViewArr.length = 0;

            this.searchProject(keyword);
            this.searchRegion(keyword);

            if(this.searchViewArr.length) {
                $('.area-tree-wrap .area-tree-search-result').html(this.searchViewArr.join(''));
                $('.area-tree-wrap .area-tree-search-result').find('ul').hide();
            } else {
                $('.area-tree-wrap .area-tree-search-result').html('<li>没有匹配结果!</li>');
            }

            $('.area-tree-wrap .area-treeResultWrap').show();
        },

        searchProject: function(keyword) {
            var areaIdArr = [],
                leafHtmlArr = [];
            var $treeStructItems = $('.area-tree-wrap .area-tree-struct-item.leaf');

            $treeStructItems.each(function(i, o) {
                var txt = $(o).text();
                if(txt.indexOf(keyword) !== -1) {
                    var areaId = $(o).attr('areaid');
                    if(areaIdArr.indexOf(areaId) == -1) {
                        // 以防项目存在于多个区域中
                        areaIdArr.push(areaId);
                        leafHtmlArr.push($(o).parent().prop('outerHTML'));
                    }
                }
            });
            this.searchViewArr = leafHtmlArr;
        },

        // 搜索地区
        searchRegion: function(keyword) {
            var $topRegions = $('.area-tree-wrap li[level=level0]').children('ul').children('li[type=branch]'),
                _this = this;

            $topRegions.each(function(i,o) {
                _this.searchRegionHandle($(o), keyword);
            });
        },

        searchRegionHandle: function($o, keyword) {
            var _this = this,
                dName = $o.children('.area-tree-struct-item.branch').text(),
                $childDeparts = $o.children('ul').children('li[type=branch]');

            if(dName.indexOf(keyword) != -1) {
                this.searchViewArr.push($o.prop('outerHTML'));
            } else {
                if($childDeparts.length) {
                    $childDeparts.each(function(i,o) {
                        _this.searchRegionHandle($(o), keyword)
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
    }


    function init(option) {
        return new Tree(option);
    }
    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('ATree2', init);
});