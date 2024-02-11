import {useEffect, useRef, useState} from "react";
import {useKey} from "./useKey";
import Loader from "./Loader";
import StarRating from "./StarRating";

const KEY = process.env.REACT_APP_API_KEY;

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState('');

    const countRef = useRef(0);

    useEffect(() => {
        if(userRating)
            countRef.current = countRef.current + 1
    }, [userRating]);

    const isWatched = watched.map(movie => movie.imdbId).includes(selectedId);
    const watchedUserRating = watched.find(movie=> movie.imdbId === selectedId)?.userRating;

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    function handleAdd() {
        const newWatchedMovie = {
            imdbId: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: +runtime.split(' ').at(0),
            userRating,
            countRatingDecision: countRef.current
        }
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    useEffect(function (){
        async function getMovieDetails() {
            setIsLoading(true);
            const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
            const data = await res.json();
            setMovie(data);
            setIsLoading(false);
        };
        getMovieDetails();
    }, [selectedId]);

    useEffect(function() {
        if(!title) return;
        document.title = `Movie | ${title}`;

        return function (){
            document.title = 'usePopcorn';
        }
    }, [title]);

    useKey('Escape', onCloseMovie);

    return (
        <div className={'details'}>
            {isLoading ? <Loader /> :
                (<>
                        <header>
                            <button className={'btn-back'} onClick={onCloseMovie}>&larr;</button>
                            <img src={poster} alt={`Poster of ${movie} movie`}/>
                            <div className="details-overview">
                                <h2>{title}</h2>
                                <p>
                                    {released} &bull; {runtime}
                                </p>
                                <p>{genre}</p>
                                <p>
                                    <span>⭐️</span>
                                    {imdbRating} IMDb rating
                                </p>
                            </div>
                        </header>

                        <section>
                            <div className={'rating'}>
                                {!isWatched ?
                                    <>
                                        <StarRating
                                            maxRating={10}
                                            size={24}
                                            onSetRating={setUserRating}
                                        />

                                        {userRating > 0 && (
                                            <button className={'btn-add'} onClick={handleAdd}>
                                                + Add to list
                                            </button>
                                        )
                                        }
                                    </> :
                                    (<p>You rated this movie {watchedUserRating} <span>⭐️</span></p>)
                                }
                            </div>
                            <p><em>{plot}</em></p>
                            <p>Starring {actors}</p>
                            <p>Directed by {director}</p>
                        </section>
                    </>
                )
            }
        </div>
    );
}

export default MovieDetails;