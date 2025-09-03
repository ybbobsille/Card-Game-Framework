import styles from "../style/Action_Bar.module.css"

function Option_Tree({ tree }) {

    return (
        <div className={styles.optionTree}>
        </div>
    )
}

function Window_Controls() {
    const svg = {
        minimize: <img src="../static/svg/window-minimize.svg" alt="" />,
        maximize: <img src="../static/svg/window-maximize.svg" alt="" />,
        close: <img src="../static/svg/window-close.svg" alt="" />
    }

    return (
        <div className={styles.windowControls}>
            <button onClick={window.App_Managment.windowControls.minimize}>{svg.minimize}</button>
            <button onClick={window.App_Managment.windowControls.maximize}>{svg.maximize}</button>
            <button onClick={window.App_Managment.windowControls.close}>{svg.close}</button>
        </div>
    )

}

export default function Action_Bar({ mode }) {
    var option_tree
    if (mode == "edit") {
        option_tree = {

        }
    }
    else {
        option_tree = {
            error: {
                show: () => alert(`A mode of '${mode}' was not found`)
            }
        }
    }
    
    return (
        <div className={styles.actionBar}>
            <Window_Controls />
            <Option_Tree tree={option_tree} />
        </div>
    )
}