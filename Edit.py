import os, json, shutil, sys
os.system("cls")
try:
    from enum import Enum
    from typing import Sequence
    import webview
    import configparser
    from flask import Flask, render_template, redirect, send_from_directory, jsonify
except Exception as e:
    input(f"ERROR: {e}\ndebug:{sys.executable}\n\nReason: This is most likly caused by requirements.txt not being installed currectly or being launched without using 'Start_Editor.bat'")
    quit()

def Ask_For_File(file_types: dict):
    file_path = webview.windows[0].create_file_dialog(
            webview.OPEN_DIALOG,
            allow_multiple=False,              # only one file allowed
            file_types=file_types
        )
    if file_path:
        return file_path[0].replace("\\", "/")  # Return the first selected file
    return None

class Config:
    class Sections(Enum):
        USER = 0

    def Get(section: str, var_name: str) -> any:
        if type(section) == Config.Sections: section = section.name

        config = configparser.ConfigParser()
        config.read('config.ini')
        if section not in config: return None
        
        value = config[section].get(var_name)
        value_type = config[section].get(f"{var_name}--type")

        if value_type == "str":
            ...
        elif value_type == "json":
            value = json.loads(value)

        return value
    
    def Set(section: str, var_name: str, value: any):
        if type(section) == Config.Sections: section = section.name

        config = configparser.ConfigParser()
        config.read('config.ini')
        if section not in config: config["USER"] = {}
        
        value_type = type(value)

        if value_type == str:
            value_type = "str"
        elif value_type in [dict, list]:
            value_type = "json"
            value = json.dumps(value)
        else:
            input(f"Unknown value type '{value_type}'")

        config[section][var_name] = value
        config[section][f"{var_name}--type"] = value_type

        with open('config.ini', 'w') as configfile:
            config.write(configfile)

class Server:
    app = Flask(__name__, static_folder="./static", template_folder="./html")
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    def Package_Data(data: dict | list):
        response = jsonify(data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    @app.route("/file/<path:filename>")
    def serve_file(filename):
        return send_from_directory('', filename)

    @app.route("/")
    def Index():
        return render_template("Index.html",
            Game_Name="Test"
        )

class API:
    file_tree: dict

    def Get_Window_HTML(self, win_type: str, Window_Id: int):
        if win_type == "testing":
            return {
                    "win_type": win_type,
                    "Window_Id": Window_Id,
                    "HTML":f"done loading: {Window_Id}"
                }

        html = ""
        with open(f"html/Windows/{win_type}.html", "r") as f:
            html = f.read()
        
        css = ""
        if os.path.isfile(f"static/css/Windows/{win_type}.css") == True:
            with open(f"static/css/Windows/{win_type}.css", "r") as f:
                css = f.read()
        
        return {
            "win_type": win_type,
            "Window_Id": Window_Id,
            "HTML":html,
            "Css":css
        }

    def Load(self, Game_Name: str):
        data = {}

        if os.path.isdir(f"Games/{Game_Name}") == False or os.path.isfile(f"Games/{Game_Name}/data.json") == False:
            return {}

        with open(f"Games/{Game_Name}/data.json", "r") as f:
            data = json.load(f)
            
        return data
    
    def Save(self, data, Game_Name: str):
        if os.path.isdir(f"Games/{Game_Name}") == False:
            os.makedirs(f"Games/{Game_Name}")
        
        with open(f"Games/{Game_Name}/data.json", "w") as f:
            json.dump(data, f, indent="    ")
            
    def Restart(self):
        global window
        os.startfile("Edit.py")
        window.destroy()

    def Get_Full_File_Tree(self, Game_Name: str):
        file_data = {
            "tree": {},
            "file_info": {}
        }

        Resource_Path = f"Games/{Game_Name}/Resources"
        if os.path.isdir(Resource_Path) == False: return file_data
        queue = [f"{Resource_Path}/{x}" for x in os.listdir(Resource_Path)]
        file_index = 0
        
        for q in queue:
            if os.path.isfile(q):
                q = q.replace(f"{Resource_Path}/", "").split("/")
                file = q.pop(-1)

                file_name = file.split(".")
                file_type = file_name.pop(-1)
                file_name = ".".join(file_name)
                file_path = f"{",".join(q)},{file_name}"

                target = file_data["tree"]
                for path in q:
                    if path not in target: target[path] = {}
                    target = target[path]
                target[file_name] = file_index

                # fill file data
                file_data["file_info"][str(file_index)] = {
                    "type": file_type,
                    "name":file_name,
                    "id":file_index,
                    "path":file_path
                }

                file_index += 1

            elif os.path.isdir(q):
                items = os.listdir(q)
                if len(items) == 0: #add folder anyway
                    q = q.replace(f"{Resource_Path}/", "").split("/")
                    target = file_data["tree"]
                    for path in q:
                        if path not in target: target[path] = {}
                        target = target[path]
                    continue
                
                queue += [f"{q}/{x}" for x in items]
            
            else:
                input(f"Cant identify file or folder '{q}'")

        self.file_tree = file_data
        return file_data

    def Delete_Resource(self, Game_Name: str, Path: str):
        Path = self.Get_Full_Resource_Path(Game_Name, Path)

        if os.path.isfile(Path):
            os.remove(Path)
        elif os.path.isdir(Path):
            shutil.rmtree(Path)
        else:
            print("ERROR")
        
        self.Get_Full_File_Tree(Game_Name)

    def Get_Full_Resource_Path(self, Game_Name: str, Path: str):
        target = self.file_tree["tree"]
        try:
            for p in Path.split("/"):
                target = target[p]
            
            if type(target) != int: target = None
        except:
            target = None
        return f"Games/{Game_Name}/Resources/{Path}{"" if target == None else f".{self.file_tree["file_info"][str(target)]["type"]}"}"

    def Add_Resource(self, Game_Name: str, Target_Path: str):
        File_Source = Ask_For_File((
            "All files (*.txt;*.png;*.mp3)",
            "Text files (*.txt)",
            "Image files (*.png)",
            "Audio files (*.mp3)"
        ))
        if File_Source == None: return
        if os.path.isfile(File_Source) == False: print(File_Source); return

        Target_Path = f"Games/{Game_Name}/Resources/{Target_Path}{"/" if Target_Path != "" else ""}"
        if os.path.isdir(Target_Path == False): os.makedirs(Target_Path)

        data = None
        with open(File_Source, "rb") as f:
            data = f.read()

        File_Name = File_Source.split("/")[-1]
        File_Type = File_Name.split(".")[-1]
        # check for unsuported files and convert them
        if File_Type == "": 
            ...
        
        if os.path.isdir(Target_Path) == False: os.makedirs(Target_Path)
        with open(f"{Target_Path}{File_Name}", "wb") as f:
            f.write(data)

    def Add_Resource_Folder(self, Game_Name: str, Target_Path: str, Name: str):
        Target_Path = f"Games/{Game_Name}/Resources/{Target_Path}{"/" if Target_Path != "" else ""}{Name}"
        if os.path.isdir(Target_Path):print(Target_Path);return
        os.makedirs(Target_Path)

    def Rename_Resource_Item(self, Game_Name: str, Target_Path: str, New_Name: str):
        Target_Path = self.Get_Full_Resource_Path(Game_Name, Target_Path)
        is_file = os.path.isfile(Target_Path)

        New_Path = Target_Path.split("/")
        if is_file:
            New_Path[-1] = New_Path[-1].split(".").pop(-1)
            New_Path[-1] = f"{New_Name}.{New_Path[-1]}"
        else:
            New_Path[-1] = New_Name
        New_Path = "/".join(New_Path)

        try:
            os.rename(Target_Path, New_Path)
        except Exception as e:
            print(e)

    def Get_Resource_Content(self, Game_Name: str, Target_Path: str):
        Target_Path = self.Get_Full_Resource_Path(Game_Name, Target_Path)

        if os.path.isdir(Target_Path): return {"mode":"error", "error":"ERROR: Path leads to folder, not a file"}
        if os.path.isfile(Target_Path) == False: return {"mode":"error", "error":"ERROR: File could not be found"}
        
        file = Target_Path.split("/")[-1]
        file_name = file.split(".")
        file_type = file_name.pop(-1)

        content = {}

        if file_type == "txt":
            content["mode"] = "text"
            with open(Target_Path, "r") as f:
                content["text"] = f.read()
        elif file_type in ["mp3", "png"]:
            content["mode"] = "url"
            content["url"] = f"/file/{Target_Path}"#Server.Generate_Resource_Url(Target_Path)
        
        return content

    def Get_External_Editor_Info(self, Game_Name: str, File_Info: dict):
        cmd = Config.Get(Config.Sections.USER, f"external_editor_{File_Info["type"]}")
        name = Config.Get(Config.Sections.USER, f"external_editor_{File_Info["type"]}_name")
        if cmd == None or name == None: return {"cmd":"start ms-settings:apps-and-features", "name":"(No editor selected)"}
        data = {
            "cmd":cmd.format(fp=self.Get_Full_Resource_Path(Game_Name, File_Info["path"].replace(",", "/")).replace("/", "\\")),
            "name":name
        }
        return data

    def Execute_CMD(self, cmd: str):
        print(cmd)
        os.system(cmd)

    def Log(self, msg):
        print(msg)

if __name__ == "__main__":
    global window
    api = API()
    server = Server()

    window = webview.create_window("test", server.app, http_port=56068, js_api=api, maximized=True)
    webview.start(debug=True, http_port=56068)
