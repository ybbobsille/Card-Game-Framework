var Game_Data = {}
var Game_Name = null
var Next_Window_id = 0
var DropDownMenu = null
var Window_Data = {}

function Win_Type_To_Class(win_type) {
    if (win_type == "Card") {
        return Window_Card
    }
    else if (win_type == "CardTemplate") {
        return Window_CardTemplate
    }
    else if (win_type == "NewCard") {
        return Window_NewCard
    }
    else if (win_type == "CardFunctionality") {
        return Window_CardFunctionality
    }
}

function Create_Window(title, win_type, args = undefined) {
    var Window_Id = Next_Window_id
    Next_Window_id += 1

    //create class and storage location
    Window_Class = Win_Type_To_Class(win_type)
    Window_Data[Window_Id] = {Class: Window_Class}

    //create navbar button
    container = document.createElement("div")
    container.classList.add("WindowTab")
    container.dataset.window_id = Window_Id
    container.dataset.window_type = win_type
    container.title = title

    button = document.createElement("button")
    button.innerHTML = "X"

    p = document.createElement("p")
    p.innerHTML = (title.length <= 18 ? title : title.slice(0, 15) + "...")

    WindowTabs = document.getElementById("WindowTabs")

    container.addEventListener('click', function (event) {
        target = event.target

        if (target.nodeName == "P") { target = target.parentElement }

        Select_Window(target.getAttribute('data-window_id'))
    });
    button.addEventListener('click', function (event) {
        event.stopPropagation();
        Remove_Window(event.target.parentElement.getAttribute('data-window_id'))
    });

    container.appendChild(button)
    container.appendChild(p)
    WindowTabs.appendChild(container)

    //create window instance
    WindowContainer = document.getElementById("Windows")
    New_Window = document.createElement("div")
    New_Window.classList.add(win_type)
    New_Window.classList.add("Window")
    New_Window.style["display"] = "none"
    New_Window.dataset.window_id = Window_Id
    New_Window.dataset.window_type = win_type
    New_Window.innerHTML = "Loading...<br>If this is taking a long time, there might have been a problem."

    WindowContainer.appendChild(New_Window)
    pywebview.api.Get_Window_HTML(win_type, Window_Id).then((result) => {
        page = document.querySelector(`#Windows .Window[data-window_id="${result["Window_Id"]}"]`)
        page.innerHTML = result["HTML"]

        const css = document.createElement('style');
        css.textContent = result["Css"];
        page.appendChild(css);
        
        Select_Window(result["Window_Id"])
        // start window class
        if (Window_Data[Window_Id]["Class"]) 
        {
            if (args == undefined) {
                Window_Data[Window_Id]["Class"] = new Window_Data[Window_Id]["Class"](Window_Id)
            }
            else {
                Window_Data[Window_Id]["Class"] = new Window_Data[Window_Id]["Class"](Window_Id, args)
            }
        }
    })
}

function Remove_Window(Window_Id) {
    //remove navbar button
    document.querySelector(`#WindowTabs .WindowTab[data-window_id="${Window_Id}"]`).remove()

    //remove window instance
    document.querySelector(`#Windows .Window[data-window_id="${Window_Id}"]`).remove()

    //remove window data
    delete Window_Data[Window_Id]
    Select_Any_Window()
}

function Select_Any_Window() {
    windows = document.querySelectorAll("#Windows .Window")
    if (windows.length != 0) {Select_Window(windows[0].dataset.window_id)}
}

function Select_Window(Window_Id) {
    document.getElementById("Inspector").innerHTML = ""
    windows = document.querySelectorAll("#Windows .Window")
    for (i of windows) {
        if (i.dataset.window_id == Window_Id) {
            i.style["display"] = "block"
        }
        else {
            i.style["display"] = "none"
        }
    }

    windows = document.querySelectorAll("#NavBar #WindowTabSelect #WindowTabs .WindowTab")
    for (i of windows) {
        if (i.dataset.window_id == Window_Id) {
            i.classList.add("SelectedWindowTab")
        }
        else {
            i.classList.remove("SelectedWindowTab")
        }
    }
}

function Select_Or_Create_Window(title, win_type) {
    windows = document.querySelectorAll("#Windows .Window")
    
    for (w of windows) {
        try {
            if (w.dataset.window_type == win_type) {
                Select_Window(w.dataset.window_id)
                return
            }
        }
        catch(e) {}
    }

    Create_Window(title, win_type)
}

function Is_Window_Open(win_type) {
    windows = document.querySelectorAll("#Windows .Window")
    
    for (w of windows) {
        try {
            if (w.dataset.window_type == win_type) {
                return true
            }
        }
        catch(e) {}
    }

    return false
}

function NavBarOption_Dropdown(target) {
    drop = target.querySelector(".Dropdown")
    drop.style["display"] = "block"
    DropDownMenu = drop
}

function Close_Dropdown() {
    if (DropDownMenu == null) {return}

    DropDownMenu.style["display"] = "none"
    DropDownMenu = null
}

async function Load() {
    try {
        const data = await pywebview.api.Load(Game_Name);
        Game_Data = data
    
        document.getElementById("Loading").style["display"] = "none"
        document.getElementById("Content").style["display"] = "block"

        Create_Window('Index', 'Index')
        //Select_Or_Create_Window('Card Template', 'CardTemplate')
        //Create_Window('Testing basic Functionality for Cards', 'Card', {card_name:"Test_Card"})
        //Create_Window('Testing basic Functionality for Cards', 'CardFunctionality', {card_name:"Test_Card"})
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function Save() {
    console.log("Save")
    pywebview.api.Save(Game_Data, Game_Name)
}

function Undo() {
}

document.addEventListener('keydown', function (event) {
    // Check for Ctrl+Z (Undo)
    if (event.ctrlKey && event.key === 'z') {
        event.preventDefault()
        Undo()
    }

    // Check for Ctrl+S (Save)
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        Save()
    }
});

window.addEventListener('pywebviewready', function () {
    //handle class clicks
    document.body.addEventListener('click', function (event) {
        if (DropDownMenu != null && !(DropDownMenu == event.target || DropDownMenu == event.target.parentElement)) {
            Close_Dropdown()
        }

        if (event.target && event.target.classList.contains('NavBarOption')) {
            NavBarOption_Dropdown(event.target);
        }
    });

    Game_Name = document.getElementById("Content").dataset.game_name

    Load()
})