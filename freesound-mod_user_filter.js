// ==UserScript==
// @name         Compact & Ignored Users in Freesound Moderation
// @namespace    https://qubodup.github.io/
// @version      2024-05-21
// @description  Reduce burnout
// @author       qubodup
// @match        https://freesound.org/tickets/moderation/
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    // close modal by clicking outside of it https://stackoverflow.com/a/37573735/188159
    $('body').click(function (event) {
        if(!$(event.target).closest('.modal-content').length && $(event.target).is('.modal-wrapper')) {
            $("div.modal-header > span.close").click();
        }
    });

    // localStorage
    var fsmciu = {}

    // localStorage
    function localSave() {
        localStorage.fsmciu = JSON.stringify(fsmciu);
    }

    function localLoad() {
        if ( localStorage.fsmciu === undefined ) {
            fsmciu = {};
        }
        else {
            fsmciu = JSON.parse(localStorage.fsmciu);
        }
        // complicated for in-dev new values
        if ( fsmciu.prefer === undefined ) fsmciu.prefer = [];
        if ( fsmciu.ignore === undefined ) fsmciu.ignore = [];
        if ( fsmciu.filter === undefined ) fsmciu.filter = 'all';
    }

    function userAdd(name, array) {
        let index = array.indexOf(name);
        if (index == -1) array.push(name);
    }

    function userRemove(name, array) {
        let index = array.indexOf(name);
        if (index !== -1) array.splice(index, 1);
    }

    localLoad();

    // CSS
    GM_addStyle(`.fsmciu_item { background-color: white; }
                 .fsmciu_item .start { border-width: 1px 1px 0 1px; border-style: solid; border-color: #ddd; border-radius: 12px 12px 0 0; padding-bottom: 8px; }
                 .fsmciu_item .btn-inverse { padding: 8px 12px; letter-spacing: 0; border-color: #ddd; transition: none; width: 100%; text-align: center; }
                 .fsmciu_item .btn-inverse:nth-child(1) { border-radius: 0 0 0 12px; border-right-width: 0; width: 60% }
                 .fsmciu_item .btn-inverse:nth-child(2) { border-radius: 0; border-right-width: 0; width: 20%; }
                 .fsmciu_item .btn-inverse:nth-child(3) { border-radius: 0 0 12px 0; width: 20%; }
                 .fsmciu_item .v-spacing-top-2.padding-bottom-5.center { margin-top: 0; }
                 .fsmciu_item .fsmciu_notes-none { color: #ddd; }
                 .fsmciu_item .fsmciu_notes-any { color: black; background-color: yellow; }
                 .fsmciu_item img.avatar, .fsmciu_item .no-avatar { border-radius: 11px 0 0 0; }
                 .fsmciu_item > div.start > div.padding-left-3 { overflow: hidden; text-overflow: ellipsis !important; }
                 .fsmciu_item a { transition: none; }
                 .fsmciu_item.fsmciu_prefer .start { background: linear-gradient(45deg, white 85%, lightgreen 85%); }
                 .fsmciu_item.fsmciu_ignore .start { background: linear-gradient(45deg, white 85%, lightgrey 85%); }
                 .fsmciu_item.fsmciu_prefer .fsmciu_toggle_prefer,
                 .fsmciu_item.fsmciu_ignore .fsmciu_toggle_ignore { color: white; background-color: grey; }
                 .fsmciu_item.fsmciu_hidden { display: none; }
                 `);

    // each user item
    $('body > div.bw-page > div > div > div.col-12.no-paddings.v-spacing-5 > div:nth-child(4) > div.row.v-spacing-top-4 > div').each(function(){
        $(this).addClass('fsmciu_item');

        var name_ele = $(this).find('a')[0];
        var name = $(name_ele).text();
        var new_ele = $(this).find('a')[1];
        var new_count = $(new_ele).text().split(' ')[0];
        var modnotes_ele = $(this).find('a')[2];
        var modnotes_count = $(modnotes_ele).text().trim().split(' ')[0];
        var days_ele = $(this).find('span')[0];
        var days_count = $(days_ele).text().split(' ')[0];
        var allsounds_ele = $(this).find('span')[1];
        var allsounds_count = $(allsounds_ele).text().split(' ')[0];

        var bottom_bar = $(this).find('div.v-spacing-top-2.padding-bottom-5.center > a');

        $(name_ele).addClass('fsmciu_userlink');
        if ( fsmciu.prefer.includes(name) ) { $(this).addClass('fsmciu_prefer'); }
        else if ( fsmciu.ignore.includes(name) ) { $(this).addClass('fsmciu_ignore'); }

        // reformat new sounds and all sounds count
        $(new_ele).text( $(new_ele).text().replace(/unassigned sounds?/,'new').trim() );
        $(allsounds_ele).text( ' / ' + $(allsounds_ele).text().replace(/uploaded sounds?/,'all') );
        $(allsounds_ele).insertAfter($(new_ele));

        // reformat days / notes count
        $(days_ele).text( $(days_ele).text().replace(/ days? in queue/,'d / ') );
        $(modnotes_ele).text( $(modnotes_ele).text().replace(/mod annotations?/,'notes') );
        if ( parseInt(modnotes_count) == 0 ) { $(modnotes_ele).addClass('fsmciu_notes-none'); } else { $(modnotes_ele).addClass('fsmciu_notes-any'); }
        $(modnotes_ele).insertAfter($(days_ele));

        // saved one line
        $(this).find('br')[2].remove();

        // restyle assign button
        $(this).find('a.btn-inverse.no-hover').text('Assign');
        $(this).find('span.bw-icon-plus').removeClass('bw-icon-plus');

        // add/toggle/remove prefer (favorite)/block buttons
        $(bottom_bar).after('<a class="btn-inverse no-hover fsmciu_toggle_prefer" href="javascript:void(0);">★</a><a class="btn-inverse no-hover fsmciu_toggle_ignore" href="javascript:void(0);">🛇</a>');
        $(this).find('.fsmciu_toggle_prefer').click(function(){
            // already added
            if ( $(this).parent().parent().hasClass('fsmciu_prefer') ) {
                $(this).parent().parent().removeClass('fsmciu_prefer');
                userRemove(name, fsmciu.prefer);
            } else {
                $(this).parent().parent().removeClass('fsmciu_ignore');
                $(this).parent().parent().addClass('fsmciu_prefer');
                userAdd(name, fsmciu.prefer);
                userRemove(name, fsmciu.ignore);
            }
            localSave();
        });
        $(this).find('.fsmciu_toggle_ignore').click(function(){
            // already added
            if ( $(this).parent().parent().hasClass('fsmciu_ignore') ) {
                $(this).parent().parent().removeClass('fsmciu_ignore');
                userRemove(name, fsmciu.ignore);
            } else {
                $(this).parent().parent().removeClass('fsmciu_prefer');
                $(this).parent().parent().addClass('fsmciu_ignore');
                userAdd(name, fsmciu.ignore);
                userRemove(name, fsmciu.prefer);
            }
            localSave();
        });

    });
    // each user item DONE

    // filter
    $('body > div.bw-page > div > div > div.col-12.no-paddings.v-spacing-5 > div:nth-child(4) > form > div > div.select-dropdown.select-dropdown--0').after(`<div style="display: inline-block;">
	<span>filter:</span>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_all" value="all">
	<label name="fsmciu_filter" for="fsmciu_filter_all">all</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_noignore" value="noignore">
	<label name="fsmciu_filter" for="fsmciu_filter_noignore">noignore</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_onlyfav" value="onlyfav">
	<label name="fsmciu_filter" for="fsmciu_filter_onlyfav">onlyfav</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_onlyignore" value="onlyignore">
	<label name="fsmciu_filter" for="fsmciu_filter_onlyignore">onlyignore</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_onlyundecided" value="onlyundecided">
	<label name="fsmciu_filter" for="fsmciu_filter_onlyundecided">onlyundecided</label>
</div>`);

    function filterUsers() {
        if ( fsmciu.filter == 'all' ) {
            $('.fsmciu_item').removeClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'noignore' ) {
            $('.fsmciu_item').removeClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_ignore').addClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'onlyfav' ) {
            $('.fsmciu_item').addClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_prefer').removeClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'onlyignore' ) {
            $('.fsmciu_item').addClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_ignore').removeClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'onlyundecided' ) {
            $('.fsmciu_item').removeClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_ignore').addClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_prefer').addClass('fsmciu_hidden');
        }
    }

    // click default filter
    $('input[type="radio"][value="' + fsmciu.filter + '"]').click();

    $("input[name='fsmciu_filter']").change(function() {
        let filter = $("input[type='radio'][name='fsmciu_filter']:checked").val();
        if (filter == fsmciu.filter) { return; } // stop wasting time
        fsmciu.filter = filter;
        filterUsers();
        localSave();
    })

    // initial filter
    filterUsers();

})();
