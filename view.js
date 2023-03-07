// ---- Define your dialogs  and panels here ----
let perm_panel_id_prefix = "effective_perm_panel";
let add_info_col = true;
let perm_panel = define_new_effective_permissions(perm_panel_id_prefix, add_info_col, which_permissions = null);

let user_panel_id_prefix = "user_select"
let  select_button_text = "Select User";
let user_panel = define_new_user_select_field(user_panel_id_prefix, select_button_text, on_user_change = function(selected_user){
    $('#effective_perm_panel').attr('username', selected_user)
});

$('#sidepanel').append(perm_panel)
$('#sidepanel').append(user_panel)

let blank_dialog_id_prefix = "perm_dialog"
let blank_dialog = define_new_dialog(blank_dialog_id_prefix, title='Permissions', options = {});


$('.perm_info').click(function(){
    console.log('clicked!');

    // open dialog box
    $(blank_dialog).dialog( "open" );

    console.log($('#effective_perm_panel').attr('filepath'));
    console.log($('#effective_perm_panel').attr('username'));
    console.log($( this ).attr('permission_name'));

    // get variables
    let click_filename = $('#effective_perm_panel').attr('filepath');
    let click_username = $('#effective_perm_panel').attr('username');
    let permission_type = $( this ).attr('permission_name');

     // get variable objects
    my_file_obj_var = path_to_file[click_filename];
    my_user_obj_var = all_users[click_username];

    // get permission text
    let users_permissions = allow_user_action(my_file_obj_var, my_user_obj_var, permission_type, explain_why = true);
    let explanation_text = get_explanation_text(users_permissions)
    console.log(explanation_text);

    $(blank_dialog).text(explanation_text);

})

// ---- Display file structure ----
$('#effective_perm_panel').attr('filepath', '/C')


// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 