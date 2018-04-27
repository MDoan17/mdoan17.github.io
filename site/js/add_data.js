function updatePanel(id, update) {
    return '<div class="panel-group">'
    +    '<div class="panel panel-default">'
    +        '<div class="panel-heading">'
    +        updateTitle(id, update.title, update.date)
    +        '</div>'
    +        '<div id="updates_' + id + '" class="panel-collapse collapse">'
    +            '<div class="panel-body">'
    +                panelContent(id, update.tag, update.attributes, update.content)
    +            '</div>'
    +        '</div>'
    +   '</div>'
    +'</div>'
}

function updateTitle(id, title, date) {
    return '<h4><a class="panel-link" data-toggle="collapse" href="#updates_' + id + '">' + title + '</a><small class="pull-right">' + date + '</small></h4>';
}

function panelContent(id, tag, attributes, content) {
    var text = '<' + tag + ' ' + attributes + '>';
    for (var i = 0; i < content.length; i++) {
        text +=  '<' + content[i].tag + ' ' + content[i].attributes + '>' + content[i].text + '</' + content[i].tag + '>';
    }
    return text + '</' + tag + '>';
}

function projectPanel(id, project) {
    return '<div class="panel-group">'
    +    '<div class="panel panel-default">'
    +        '<div class="panel-heading">'
    +            projectTitle(id, project.name, project.last_updated)
    +        '</div>'
    +        '<div id="projects_' + id + '" class="panel-collapse collapse">'
    +            '<div class="panel-body">'
    +                '<div class="hidden-xs project-image">'
    +                    projectImage(project.image_src)
    +                '</div>'
    +                '<div class="project-infobox">'
    +                    panelContent(id, project.tag, project.attributes, project.content)
    +                '</div>'
    +                '<div class="project-footer pull-right">'
    +                    '<button class="btn btn-primary">Run</button>'
    +                    '<button class="btn btn-primary">Download</button>'
    +                '</div>'
    +            '</div>'
    +        '</div>'
    +    '</div>'
    +'</div>'
}

function projectTitle(id, name, date) {
    return '<h4><a class="panel-link" data-toggle="collapse" href="#projects_' + id + '">' + name + '</a><small class="pull-right">Last Updated: ' + date + '</small></h4>'
}

function projectImage(image) {
    return '<div class="img-template"><img src="' + image + '"></img>"</div>'
}

$(document).ready(function() {
    for (var i = updates.length - 1; i >= 0; i--) {
        $("#update-container").html($("#update-container").html() + updatePanel(i, updates[i]));
    }
    $("#updates_" + (updates.length - 1)).addClass("in");
    for (var i = 0; i < projects.length; i++) {
        $("#project-container").html($("#project-container").html() + projectPanel(i, projects[i]));
    }
    $("#projects_0").addClass("in");
});
