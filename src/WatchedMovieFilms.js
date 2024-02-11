import WatchedMovie from "./WatchedMovie";

function WatchedMovieFilms({watched, onDeleteWatched}) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbId} onDeleteWatched={onDeleteWatched}/>
            ))}
        </ul>
    );
}

export default WatchedMovieFilms;