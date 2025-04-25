import json

class InputHandler:
    def __init__(self):
        pass

    def tick(self, delta):
        ...

    def test(self):
        print("test")

class Render:
    Game_Data: dict
    frame_history = []

    def __init__(self):
        Default_Render_Data = {

        }

        with open("data.json", "r") as f:
            self.Game_Data = json.load(f)
    
    def tick(self, delta):
        self.frame_history.append(delta)
        if len(self.frame_history) > 10: self.frame_history.pop(0)
        self.fps = 1 / (sum(self.frame_history) / 10)
        print(f"fps: {self.fps}")

def Startup():
    print("Runtime Starting...")
    render = Render()
    inputhander = InputHandler()
    print("Runtime Startup Complete!")

    return render, inputhander
