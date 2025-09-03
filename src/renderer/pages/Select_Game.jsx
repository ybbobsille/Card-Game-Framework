import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Action_Bar from "../components/Action_Bar";
import styles from "../style/Select_Game.module.css"

export default function Select_Game() {
    const [games, setGame] = useState(null);

    useEffect(() => {
        window.Api.games.List().then(setGame);
    }, []);

    if (!games) {
        return <p className="loading">Loading...</p>;
    }

    return (
        <>  
            <Action_Bar mode="select" />
            <div className={styles.actionBar}>
                <h1 className={styles.title}>Select a Game</h1>
            </div>
            <div className={styles.gameList}>
                <div key="Row_Names" className={`${styles.rowNames} ${styles.gameCard}`}>
                    <p className={styles.gameName}>Game Name</p>
                    <p className={styles.authorName}>Author</p>
                    <p className={styles.version}>Version</p>
                    <p className={styles.description}>Description</p>
                </div>
                {games.map((game) => (
                    <Link to={`/edit/${game.Game_ID}`} key={game.Game_ID} className={styles.gameCard}>
                        <p className={styles.gameName}>{game.Game_Name}</p>
                        <p className={styles.authorName}>{game.Author}</p>
                        <p className={styles.version}>{game.Version}</p>
                        <p className={styles.description}>{game.Description}</p>
                    </Link>
                ))}
            </div>
        </>
    );
}
