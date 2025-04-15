function updateValueAtPath(obj, path, value) {
    // Clone the object to avoid mutating the original one
    let current = obj;

    // Loop through the path, except for the last part
    for (let i = 0; i < path.length - 1; i++) {
        if (path[i] in current == false) {
            current[path[i]] = {}
        }

        current = current[path[i]];
    }

    // Finally, set the value at the last path element
    current[path[path.length - 1]] = value;
}

function Get_Card_List() {
    if ("Card_Info" in Game_Data == true && "List" in Game_Data["Card_Info"] == true) {
        return Object.keys(Game_Data["Card_Info"]["List"])
    }

    return []
}

Card_Renderers = {}

class Card_Renderer {
    static TemplateBlockInfo = {
        "Body": {
            "Classes": ["SelectionList", "CornerRadius", "AspectRatio", "RGB", "Parent", "CardFunctionality"],
            "Style": {
                "aspect-ratio": "2.5/3.5",
                "background-color": "rgb(0, 0, 0)",
                "border-radius": "0.63cm"
            }
        },
        "Box": {
            "Classes": ["SelectionList", "X", "Y", "Height", "Width", "RGBA", "Parent", "Renamable"],
            "Style": {
                "background-color": "rgba(0, 0, 0, 1)",
                "height": "25lh",
                "width": "25lh",
                "left": "0lh",
                "top": "0lh"
            }
        },
        "Text": {
            "Classes": ["SelectionList", "X", "Y", "Height", "Width", "Font", "TextSize", "TextColor", "TextContent", "TextAlignment", "Renamable"],
            "Style": {
                "height": "10lh",
                "width": "10lh",
                "left": "0lh",
                "top": "0lh",
                "color": "rgb(0, 0, 0)",
                "text-align": "center"
            }
        }
    }

    constructor(window_selector, selection_selector, card_name) {
        this.parent_element = document.querySelector(window_selector)
        this.selection_element = document.querySelector(selection_selector)
        this.card_name = card_name
        Card_Renderers[card_name] = this
    }

    _Get_Card_Path(path, Strict = false, _Try_Template = false) {
        var new_path = ["Card_Info"]
        if (this.card_name == "Template" || _Try_Template == true) {
            new_path = new_path.concat(["Template"])
        }
        else {
            new_path = new_path.concat(["List", this.card_name])
        }
        new_path = new_path.concat(path)

        if (Strict == false && this.Is_Key_In_Card_Data(new_path, true, true) == false) {
            return this._Get_Card_Path(path, true, true)
        }

        return new_path
    }

    Get_Card_Data(path) {
        path = this._Get_Card_Path(path)

        let current = Game_Data;

        for (let i = 0; i < path.length; i++) {
            if (path[i] in current == false) {
                return undefined
            }

            current = current[path[i]];
        }

        return current
    }

    Update_Card_Data(path, value) {
        path = this._Get_Card_Path(path, true)

        if (path.includes(this.card_name) == true && this.Is_Key_In_Card_Data([], true) == false) {
            var index = path.indexOf(this.card_name);
            updateValueAtPath(Game_Data, path.slice(0, index + 1), {})
        }

        updateValueAtPath(Game_Data, path, value)
    }

    Remove_Card_Data(path) {
        path = this._Get_Card_Path(path, true)
        let current = Game_Data;

        for (let i = 0; i < path.length - 1; i++) { // Stop at second last key
            current = current[path[i]];
        }

        delete current[path[path.length - 1]]; // Delete last key from parent object
    }

    Is_Key_In_Card_Data(path, strict = false, _Is_Full_Path = false) {
        if (_Is_Full_Path == false) {
            path = this._Get_Card_Path(path, strict)
        }
        let current = Game_Data;

        for (let i = 0; i < path.length; i++) {
            if (path[i] in current == false) {
                return false
            }

            current = current[path[i]];
        }

        return true
    }

    Is_Item_In_Card_Data(path, item) {
        path = this._Get_Card_Path(path)
        let current = Game_Data;

        for (let i = 0; i < path.length; i++) {
            if (path[i] in current == false) {
                return false
            }

            current = current[path[i]];
        }

        return current.includes(item)
    }

    _Style_To_Data(style, style_type) {
        if (style_type == "color") {
            if (style.includes("rgba(")) { return style.replace("rgba(", "").replace(")", "").split(", ") }
            else { return style.replace("rgb(", "").replace(")", "").split(", ") }
        }
        else if (style_type == "height") {
            return style.replace("lh", "")
        }
        else if (style_type == "width") {
            return style.replace("lh", "")
        }
        else if (style_type == "left") {
            return style.replace("lh", "")
        }
        else if (style_type == "top") {
            return style.replace("lh", "")
        }
        else if (style_type == "aspect-ratio") {
            return style.split(" / ")
        }
        else if (style_type == "border-radius") {
            return style.replace("cm", "")
        }
        else if (style_type == "background-color") {
            if (style.includes("rgba(")) { return style.replace("rgba(", "").replace(")", "").split(", ") }
            else { return style.replace("rgb(", "").replace(")", "").split(", ") }
        }
    }

    _Data_To_Style(data, style_type) {
        if (style_type == "TextColor") {
            return `rgb(${data[0].value}, ${data[1].value}, ${data[2].value})`
        }
        else if (style_type == "Height") {
            return `${data[0].value}lh`
        }
        else if (style_type == "Width") {
            return `${data[0].value}lh`
        }
        else if (style_type == "X") {
            return `${data[0].value}lh`
        }
        else if (style_type == "Y") {
            return `${data[0].value}lh`
        }
        else if (style_type == "AspectRatio") {
            return `${data[0].value}/${data[1].value}`
        }
        else if (style_type == "CornerRadius") {
            return `${data[0].value}cm`
        }
        else if (style_type == "RGBA") {
            return `rgb(${data[0].value}, ${data[1].value}, ${data[2].value})`
        }
        else if (style_type == "RGB") {
            return `rgba(${data[0].value}, ${data[1].value}, ${data[2].value}, ${data[3].value})`
        }
    }

    _Handle_Inspector_Change = (event) => {
        var Inspector_Target = this.Get_SelectionItem(document.querySelector("#Inspector").dataset.target)

        var target = event.target
        while (target.classList.contains("InspectorItem") == false) {
            target = target.parentElement
        }

        var CL = target.classList

        if (this.Is_Key_In_Card_Data([Inspector_Target.dataset.selection_name]) == false) {
            this.Update_Card_Data([Inspector_Target.dataset.selection_name], {})
        }
        if (this.Is_Key_In_Card_Data([Inspector_Target.dataset.selection_name, "Style"]) == false) {
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style"], {})
        }

        if (CL.contains("Renamable")) {
            var input = target.querySelector(".Content .InspectorValue input")
            var Old_value = Inspector_Target.dataset.selection_name
            var New_Value = input.value
            if (input.value != "" && Old_value != New_Value) {

                Inspector_Target.dataset.selection_name = New_Value
                this.Update_Selection_List()
                this.Select_Selection_Item(New_Value)

                //update game_data name values
                this.Update_Card_Data([New_Value], this.Get_Card_Data([Old_value]))
                this.Remove_Card_Data([Old_value])

                //update game_data child values
                for (var k in this.Get_Card_Data([])) {
                    if (k != New_Value
                        && this.Is_Key_In_Card_Data([k, "Children"])
                        && this.Get_Card_Data([k, "Children"]).includes(Old_value)) {

                        const idx = this.Get_Card_Data([k, "Children"]).indexOf(Old_value);
                        if (idx !== -1) {
                            this.Update_Card_Data([k, "Children", idx], New_Value)
                        }
                    }
                }
            }
        }
        if (CL.contains("AddChild")) {
            var select = target.querySelector(".Content .InspectorValue select")
            if (select.value != "none") {
                this.AddChild_To_Item(Inspector_Target.dataset.selection_name, "auto", select.value)
            }
        }
        if (CL.contains("TextContent")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue textarea")
            var value = `${inputs[0].value}`
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Content"], value)

            value = value.replace(/\n/gi, "<br>")
            Inspector_Target.innerHTML = value
        }
        if (CL.contains("TextColor")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "TextColor")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "TextColor"], value)
            Inspector_Target.style["color"] = value
        }
        if (CL.contains("TextAlignment")) {
            var select = target.querySelector(".Content .InspectorValue select")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "TextAlignment"], select.value)
            Inspector_Target.style["text-align"] = select.value
        }
        if (CL.contains("Height")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "Height")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "Height"], value)
            Inspector_Target.style["height"] = value
        }
        if (CL.contains("Width")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "Width")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "Width"], value)
            Inspector_Target.style["width"] = value
        }
        if (CL.contains("X")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "X")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "X"], value)
            Inspector_Target.style["left"] = value
        }
        if (CL.contains("Y")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "Y")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "Y"], value)
            Inspector_Target.style["top"] = value
        }
        if (CL.contains("AspectRatio")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "AspectRatio")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "AspectRatio"], value)
            Inspector_Target.style["aspect-ratio"] = value
        }
        if (CL.contains("CornerRadius")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "CornerRadius")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "CornerRadius"], value)
            Inspector_Target.style["border-radius"] = value
        }
        if (CL.contains("RGB")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "RGB")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "RGB"], value)
            Inspector_Target.style["background-color"] = value
        }
        if (CL.contains("RGBA")) {
            var inputs = target.querySelectorAll(".Content .InspectorValue input")
            var value = this._Data_To_Style(inputs, "RGBA")
            this.Update_Card_Data([Inspector_Target.dataset.selection_name, "Style", "RGBA"], value)
            Inspector_Target.style["background-color"] = value
        }
        if (CL.contains("CardFunctionality")) {
            Create_Window(`${this.card_name} Functionality`, "CardFunctionality", {card_name:this.card_name})
        }

        this.Update_Selection_List()
    }

    _Update_Inspector_Data(element) {
        var selected = document.querySelector(".Selected")
        if (selected != undefined) { selected.classList.remove("Selected") }
        element.classList.add("Selected")

        var Inspector = document.querySelector("#Inspector")
        Inspector.dataset.target = element.dataset.selection_name
        var CL = element.classList
        var html = "<div id=\"CardTemplate\">"

        if (CL.contains("Renamable")) {
            html += `<div id="Renamable" class="InspectorItem Renamable">
            <div class="Title">Name</div>
            <div class="Content">
            <div class="InspectorValue">
                Value: <input type="text" class="OnEnter" value="${element.dataset.selection_name}" style="width: 20%;">
            </div>
            </div>
        </div>`
        }
        if (CL.contains("Parent")) {
            html += `<div id="AddChild" class="InspectorItem AddChild">
            <div class="Title">Add Child</div>
            <div class="Content">
            <div class="InspectorValue">
                Select child type to add: 
                <select name="AddChild" class="NoClick">
                    <option selected value="none">none</option>
                    <option value="Box">Box</option>
                    <option value="Text">Text</option>
                </select>
                <button id="AddChild">Add</button>
            </div>
            </div>
        </div>`
        }
        if (CL.contains("TextContent")) {
            var value = element.innerHTML.replace(/<br>/gi, "\n")
            html += `<div id="TextContent" class="InspectorItem TextContent">
            <div class="Title">Text Content</div>
            <div class="Content">
                <div class="InspectorValue">
                    <textarea style="width: 80%; height: 5lh;">${value}</textarea>
                </div>
            </div>
        </div>`
        }
        if (CL.contains("TextColor")) {
            var value = this._Style_To_Data(element.style["color"], "color")
            html += `<div id="TextColor" class="InspectorItem TextColor">
            <div class="Title">Text Color</div>
            <div class="Content">
                <div class="InspectorValue">
                    <div class="InspectorValue">Value (r,g,b) = <input type="number" step="1" value="${value[0]}" style="width: 15%; margin-right: 0%;">,<input type="number" step="1" value="${value[1]}" style="width: 15%; margin-right: 0%;">,<input type="number" step="1" value="${value[2]}" style="width: 15%;"></div>
                </div>
            </div>
        </div>`
        }
        if (CL.contains("TextAlignment")) {
            var value = element.style["text-align"]
            html += `<div id="TextAlignment" class="InspectorItem TextAlignment">
            <div class="Title">Text Alignment</div>
            <div class="Content">
                <div class="InspectorValue">Value = 
                    <select name="AddChild" style="height: calc(1lh * 1.3);">
                        <option ${value == "center" ? "selected" : ""} value="center">center</option>
                        <option ${value == "left" ? "selected" : ""} value="left">left</option>
                        <option ${value == "right" ? "selected" : ""} value="right">right</option>
                    </select>
                </div>
            </div>
        </div>`
        }
        if (CL.contains("Height")) {
            var value = this._Style_To_Data(element.style["height"], "height")
            html += `<div id="Height" class="InspectorItem Height">
        <div class="Title">Height</div>
            <div class="Content">
                <div class="InspectorValue">Value = <input type="number" step="0.1" value="${value}" style="width: 20%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("Width")) {
            var value = this._Style_To_Data(element.style["width"], "width")
            html += `<div id="Width" class="InspectorItem Width">
        <div class="Title">Width</div>
            <div class="Content">
                <div class="InspectorValue">Value = <input type="number" step="0.1" value="${value}" style="width: 20%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("X")) {
            var value = this._Style_To_Data(element.style["left"], "left")
            html += `<div id="X" class="InspectorItem X">
        <div class="Title">X</div>
            <div class="Content">
                <div class="InspectorValue">Value = <input type="number" step="0.1" value="${value}" style="width: 20%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("Y")) {
            var value = this._Style_To_Data(element.style["top"], "top")
            html += `<div id="Y" class="InspectorItem Y">
        <div class="Title">Y</div>
            <div class="Content">
                <div class="InspectorValue">Value = <input type="number" step="0.1" value="${value}" style="width: 20%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("AspectRatio")) {
            var ratio = this._Style_To_Data(element.style["aspect-ratio"], "aspect-ratio")
            html += `<div id="AspectRatio" class="InspectorItem AspectRatio">
        <div class="Title">Aspect Ratio</div>
            <div class="Content">
                <div class="InspectorValue">Value = <input type="number" step="0.01" value="${ratio[0]}" style="width: 20%;">/<input type="number" step="0.01" value="${ratio[1]}" style="width: 20%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("CornerRadius")) {
            var value = this._Style_To_Data(element.style["border-radius"], "border-radius")
            html += `<div id="CornerRadius" class="InspectorItem CornerRadius">
        <div class="Title">Corner Radius</div>
            <div class="Content">
                <div class="InspectorValue">Value = <input type="number" step="0.01" value="${value}" style="width: 20%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("RGB")) {
            var value = this._Style_To_Data(element.style["background-color"], "background-color")
            html += `<div id="RGB" class="InspectorItem RGB">
            <div class="Title">Color</div>
            <div class="Content">
                <div class="InspectorValue">Value (r,g,b) = <input type="number" step="1" value="${value[0]}" style="width: 15%; margin-right: 0%;">,<input type="number" step="1" value="${value[1]}" style="width: 15%; margin-right: 0%;">,<input type="number" step="1" value="${value[2]}" style="width: 15%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("RGBA")) {
            var value = this._Style_To_Data(element.style["background-color"], "background-color")
            html += `<div id="RGBA" class="InspectorItem RGBA">
            <div class="Title">Color</div>
            <div class="Content">
                <div class="InspectorValue">Value (r,g,b,a) = <input type="number" step="1" value="${value[0]}" style="width: 12%; margin-right: 0%;">,<input type="number" step="1" value="${value[1]}" style="width: 12%; margin-right: 0%;">,<input type="number" step="1" value="${value[2]}" style="margin-right: 0%; width: 12%;">,<input type="number" step="0.01" value="${value[3] ? value[3] : 1}" style="width: 12%;"></div>
            </div>
        </div>`
        }
        if (CL.contains("CardFunctionality")) {
            html += `<div id="CardFunctionality" class="InspectorItem CardFunctionality">
            <div class="Title">Card Functionality</div>
            <div class="Content">
                <div class="InspectorValue"><button>Edit Card Functionality</button></div>
            </div>
        </div>`
        }

        html += "</div>"
        Inspector.innerHTML = html

        var inputs = document.querySelectorAll('#Inspector input');
        inputs.forEach(input => {
            if (input.classList.contains("OnEnter")) {
                input.addEventListener('blur', this._Handle_Inspector_Change);
            }
            else {
                input.addEventListener('input', this._Handle_Inspector_Change);
            }
        });
        var textareas = document.querySelectorAll('#Inspector textarea');
        textareas.forEach(input => {
            input.addEventListener('input', this._Handle_Inspector_Change);
        });
        var buttons = document.querySelectorAll('#Inspector button');
        buttons.forEach(input => {
            input.addEventListener('click', this._Handle_Inspector_Change);
        });
        var selects = document.querySelectorAll('#Inspector select');
        selects.forEach(input => {
            if (input.classList.contains('NoClick') == false) {
                input.addEventListener('change', this._Handle_Inspector_Change);
            }
        });
    }

    Select_Selection_Item(selection_name) {
        this._Update_Inspector_Data(this.Get_SelectionItem(selection_name))
    }

    _Update_Selection_Tree(Tree, _indent = 0) {
        if (_indent == 0) {// clear pre-existing tree
            this.selection_element.innerHTML = ""
        }

        for (var key in Tree) {
            // add key to tree
            var html = `<h3 class="SelectionItem" data-selection_name="${key}">${"| ".repeat(_indent)}${key}</h3>`
            this.selection_element.innerHTML = this.selection_element.innerHTML + html

            // add child nodes
            this._Update_Selection_Tree(Tree[key], _indent + 1)
        }
    }

    Update_Selection_List() {
        this._Update_Selection_Tree(this.Get_Selection_Tree())
    }

    Get_SelectionItem(selection_name) {
        var items = this.parent_element.querySelectorAll(".SelectionList")
        for (var item of items) {
            if (selection_name == item.dataset.selection_name) {
                return item
            }
        }
    }

    Get_Selection_Tree() {
        var Tree = {}

        var root = this.parent_element
        var items = this.parent_element.querySelectorAll(".SelectionList")
        for (var item of items) {
            var path = []
            var target = item

            while (target != root) {
                if (target.classList.contains("SelectionList")) {
                    path.push(target.dataset.selection_name)
                }
                target = target.parentElement
            }

            updateValueAtPath(Tree, path.reverse(), {})
        }

        return Tree
    }

    AddChild_To_Item(parent_selection_name, child_selection_name, child_type) {
        var div = document.createElement("div")

        //classes
        var classes = Card_Renderer.TemplateBlockInfo[child_type]["Classes"]
        for (var c in classes) {
            div.classList.add(classes[c])
        }
        div.classList.add(child_type)

        //style
        for (const [key, value] of Object.entries(Card_Renderer.TemplateBlockInfo[child_type]["Style"])) {
            div.style[key] = value
        }

        //selection name
        if ("Count" in Card_Renderer.TemplateBlockInfo[child_type] == false) {
            Card_Renderer.TemplateBlockInfo[child_type]["Count"] = 0
        }
        if (child_selection_name == "auto") {
            child_selection_name = `${child_type}_${Card_Renderer.TemplateBlockInfo[child_type]["Count"]}`
        }
        Card_Renderer.TemplateBlockInfo[child_type]["Count"] += 1

        div.dataset.selection_name = child_selection_name

        //add child
        if (parent_selection_name == "root") {
            this.parent_element.appendChild(div)
        }
        else {
            this.Get_SelectionItem(parent_selection_name).appendChild(div)
        }

        //add type and parent to data
        if (this.Is_Key_In_Card_Data([child_selection_name]) == false) {
            this.Update_Card_Data([child_selection_name], {})

            //add type
            this.Update_Card_Data([child_selection_name, "Type"], child_type)

            //add parent
            this.Update_Card_Data([child_selection_name, "Parent"], parent_selection_name)
        }

        //add child info to data
        if (parent_selection_name != "root") {
            if (this.Is_Key_In_Card_Data([parent_selection_name, "Children"]) == false) { this.Update_Card_Data([parent_selection_name, "Children"], []) }

            if (this.Get_Card_Data([parent_selection_name, "Children"]).includes(child_selection_name) == false) {
                this.Get_Card_Data([parent_selection_name, "Children"]).push(child_selection_name)
            }
        }

        //this.Update_Selection_List()

        return div
    }

    _Render_Loop(parent, child) {
        var div = this.AddChild_To_Item(parent, child, this.Get_Card_Data([child, "Type"]))

        // load from save data
        if (this.Is_Key_In_Card_Data([child, "Style"])) {
            var style_rename = {
                "AspectRatio": "aspect-ratio",
                "CornerRadius": "border-radius",
                "RGB": "background-color",
                "RGBA": "background-color",
                "Height": "height",
                "Width": "width",
                "X": "left",
                "Y": "top",
                "TextColor": "color",
                "TextAlignment": "text-align"
            }

            var style_data = this.Get_Card_Data([child, "Style"])
            for (const [key, value] of Object.entries(style_data)) {
                div.style[style_rename[key]] = value
            }
        }

        if (this.Is_Key_In_Card_Data([child, "Children"])) {
            for (var c of this.Get_Card_Data([child, "Children"])) {
                this._Render_Loop(child, c)
            }
        }

        if (this.Is_Key_In_Card_Data([child, "Content"])) {
            div.innerHTML = this.Get_Card_Data([child, "Content"]).replace(/\n/gi, "<br>")
        }
    }

    Render() {
        if (this.Is_Key_In_Card_Data(["Body", "Type"]) == false) {
            this.Update_Card_Data(["Body", "Type"], "Body")
        }
        this._Render_Loop("root", "Body")
        this.Update_Selection_List()
    }
}

class Window_Card {
    constructor(window_id) {
        this.window_id = window_id
        this.Has_Card_Template = ("Card_Info" in Game_Data && "Template" in Game_Data["Card_Info"])
        this.Edit_Element = document.querySelector(`#Windows .Card[data-window_id="${this.window_id}"] #EditDisplay`)
        this.SelectCard_Element = document.querySelector(`#Windows .Card[data-window_id="${this.window_id}"] #SelectCard`)
        this.NoTemplate_Element = document.querySelector(`#Windows .Card[data-window_id="${this.window_id}"] #NoTemplate`)

        if (this.Has_Card_Template == false) {
            this.Edit_Element.style["display"] = "none"
            this.SelectCard_Element.style["display"] = "none"
            this.NoTemplate_Element.style["display"] = "block"
        }
        else {
            this.Edit_Element.style["display"] = "none"
            this.SelectCard_Element.style["display"] = "block"
            this.NoTemplate_Element.style["display"] = "none"

            var html = ""
            var cards = Get_Card_List()
            for (var card of cards) {
                html += `<div class="CardSelection" data-card_name="${card}">${card.replace(/_/g, " ")}</div>`
            }
            this.SelectCard_Element.innerHTML = html
        }

        //handle class clicks
        document.body.addEventListener('click', (event) => {
            if (event.target) {
                var target = event.target
                while (target && target.classList.contains("Window") == false) { target = target.parentElement }

                if (target && target.classList.contains("Card") && target.dataset.window_id == this.window_id) {
                    if (event.target.classList.contains('CardSelection')) {
                        this.Edit_Card(event.target.dataset.card_name)
                    }

                    if (event.target.classList.contains('SelectionItem')) {
                        Window_Data[this.window_id]["Renderer"].Select_Selection_Item(event.target.dataset.selection_name);
                    }
                }
            }
        });
    }

    Edit_Card(Card_Name) {
        this.Edit_Element.style["display"] = "block"
        this.SelectCard_Element.style["display"] = "none"
        this.NoTemplate_Element.style["display"] = "none"

        var render = new Card_Renderer(
            `#Windows .Card[data-window_id="${this.window_id}"] #View`,
            `#Windows .Card[data-window_id="${this.window_id}"] #Selection`,
            Card_Name
        )
        render.Render()
        render.Select_Selection_Item("Body")
        Window_Data[this.window_id]["Renderer"] = render
    }
}

class Window_CardTemplate {
    constructor(window_id) {
        this.window_id = window_id
        this.Load_From_Save_Data()

        //handle class clicks
        document.body.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('SelectionItem')) {
                var target = event.target
                while (target.classList.contains("Window") == false) { target = target.parentElement }

                if (target.classList.contains("CardTemplate") && target.dataset.window_id == this.window_id) {
                    Window_Data[this.window_id]["Renderer"].Select_Selection_Item(event.target.dataset.selection_name);
                }
            }
        });
    }

    Load_From_Save_Data() {
        if ("Card_Info" in Game_Data == false) {
            Game_Data["Card_Info"] = {}
            if ("Template" in Game_Data["Card_Info"] == false) { Game_Data["Card_Info"]["Template"] = {} }
        }

        var render = new Card_Renderer(
            `#Windows .CardTemplate[data-window_id="${this.window_id}"] #View`,
            `#Windows .CardTemplate[data-window_id="${this.window_id}"] #Selection`,
            "Template"
        )
        render.Render()
        Window_Data[this.window_id]["Renderer"] = render

        render.Update_Selection_List()
        render.Select_Selection_Item("Body")
    }
}

class Window_NewCard {
    constructor(window_id) {
        this.window_id = window_id
    }
}

class Window_CardFunctionality {
    static types = {
        1: "stats",
        2: "effects",
        3: "Function"
    }

    constructor(window_id, args = undefined) {
        this.window_id = window_id
        
        if (args && "card_name" in args) {
            this.Edit_Card(args["card_name"])
        }
        else {
            // card selection screen
        }
    }

    Toggle_Dropdown = (event) => {
        var target = event.target
        while (target && target.classList.contains("Item") == false) {target = target.parentElement}

        target = target.querySelector("#Dropdown")

        target.style["height"] = (target.style["height"] == "fit-content" ? "0px" : "fit-content")
    }

    _Refresh_Dropdown = (id) => {
        var data = Game_Data["Card_Info"]["Function"][this.card_name][id]

        if ("type" in data == false) {data["type"] = 1}
        if ("mode" in data == false) {data["mode"] = 1}
        if ("target" in data == false) {data["target"] = "used"}
        if ("value" in data == false) {data["value"] = 0}
        if ("event" in data == false) {data["event"] = "hand - leave"}

        var type = data["type"]
        var mode = data["mode"]
        var target = data["target"]
        var value = data["value"]
        var event = data["event"]

        var html = `
        <div id="type">
            type: <br>
            <select>
                <option ${type == 1 ? "selected" : ""} value="1">Stats</option>
                <option ${type == 2 ? "selected" : ""} value="2">Effects</option>
                <option ${type == 3 ? "selected" : ""} value="3">Function</option>
            </select>
        </div>`

        if (type == 1) { // Stats
            if ("stat" in data == false) {data["stat"] = ""}
            var stat = data["stat"]

            html += `
            <div id="mode">
                mode: <br>
                <select>
                    <option ${mode == 1 ? "selected" : ""} value="1">Add/Remove</option>
                    <option ${mode == 2 ? "selected" : ""} value="2">Multiply/Devide</option>
                    <option ${mode == 3 ? "selected" : ""} value="3">Set</option>
                </select>
            </div>
            <div id="target">
                target: <br>
                <select>
                    <option ${target == "used" ? "selected" : ""} value="used">Used</option>
                    <option ${target == "self" ? "selected" : ""} value="self">Self</option>
                </select>
            </div>
            <div id="stat">
                stat: <br>
                <input value="${stat}">
            </div>
            <div id="value">
                value: <br>
                <input type="number" value="${value}">
            </div>`
        }
        else if (type == 2) { // Effects
            html += `
            <div id="mode">
                mode: <br>
                <select>
                </select>
            </div>`
        }
        else if (type == 3) { // Function
            html += `
            <div id="mode">
                mode: <br>
                <select>
                </select>
            </div>`
        }

        html += `
        <div id="event">
            event: <br>
            <select>
                <option ${event == "hand - turn" ? "selected" : ""} value="hand - turn">Hand - Turn</option>
                <option ${event == "hand - enter" ? "selected" : ""} value="hand - enter">Hand - Enter</option>
                <option ${event == "hand - leave" ? "selected" : ""} value="hand - leave">Hand - Leave</option>
                <option ${event == "discard - turn" ? "selected" : ""} value="discard - turn">Discard - Turn</option>
                <option ${event == "discard - enter" ? "selected" : ""} value="discard - enter">Discard - Enter</option>
                <option ${event == "discard - leave" ? "selected" : ""} value="discard - leave">Discard - Leave</option>
            </select>
        </div>`

        document.querySelector(`#Windows .CardFunctionality[data-window_id="${this.window_id}"] #List .Item[data-id="${id}"] #Dropdown`).innerHTML = html
        
        var select = document.querySelectorAll(`#Windows .CardFunctionality[data-window_id="${this.window_id}"] #List .Item[data-id="${id}"] #Dropdown select`);
        select.forEach(input => {
            input.addEventListener('change', (event) => {
                var value = event.target.value
                var target = event.target
                while (target && target.classList.contains("Item") == false) {target = target.parentElement}
                var id = target.dataset.id

                if (event.target.parentElement.id == "type") {
                    Game_Data["Card_Info"]["Function"][this.card_name][id]["mode"] = 1
                }
                else if (event.target.parentElement.id == "mode") {

                }

                Game_Data["Card_Info"]["Function"][this.card_name][id][event.target.parentElement.id] = value
                this._Refresh_Dropdown(id)
            });
        });
        var inputs = document.querySelectorAll(`#Windows .CardFunctionality[data-window_id="${this.window_id}"] #List .Item[data-id="${id}"] #Dropdown input`);
        inputs.forEach(input => {
            input.addEventListener('change', (event) => {
                var value = event.target.value
                var target = event.target
                while (target && target.classList.contains("Item") == false) {target = target.parentElement}
                var id = target.dataset.id

                console.log(event.target.parentElement.id)
                Game_Data["Card_Info"]["Function"][this.card_name][id][event.target.parentElement.id] = value
                this._Refresh_Dropdown(id)
            });
        });
    }

    Refresh_List() {
        var html = ""
        var list = document.querySelector(`#Windows .CardFunctionality[data-window_id="${this.window_id}"] #List`)
        list.innerHTML = ""

        if ("Card_Info" in Game_Data && "Function" in Game_Data["Card_Info"] && this.card_name in Game_Data["Card_Info"]["Function"]) {
            html = ""
            var data = Game_Data["Card_Info"]["Function"][this.card_name]
            for (var id in data) {
                html += `<div class="Item" data-id="${id}">
                            <div id="right"><button>Edit</button></div>
                            <div id="left"><h2 id="index">${id}</h2><h2 id="spacing"> - </h2><h2 id="title">${data[id]["title"]}</h2></div>
                            <div id="Dropdown">
                            </div>
                        </div>`
                list.innerHTML += html
                this._Refresh_Dropdown(id)
            }
        }

        
        var buttons = document.querySelectorAll(`#Windows .CardFunctionality[data-window_id="${this.window_id}"] #List .Item #right button`);
        buttons.forEach(input => {
            input.addEventListener('click', this.Toggle_Dropdown);
        });
    }

    Edit_Card(card_name) {
        this.card_name = card_name
        this.Refresh_List()
        //document.querySelector(`#Windows .CardFunctionality[data-window_id="${this.window_id}"]`).innerHTML = card_name
    }

    Add_Step(id) {
        this.Refresh_List()
    }
}