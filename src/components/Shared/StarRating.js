import React, { useState } from "react";

const Star = ({ selected = false, onClick = f => f }) => (
    <div className={selected ? "star selected" : "star"} onClick={onClick} />
);
  
const StarRating = ({ totalStars, updateSelectedStars, disabled }) => {
    const [starsSelected, setStarsSelected] = useState(0);
    const updateStarSelected = (stars) => {
        if (!disabled) {
            setStarsSelected(stars);
            updateSelectedStars(stars);
        }
    }
    return (
        <div className="star-rating mt-2 mb-4">
        {[...Array(totalStars)].map((n, i) => (
            <Star
            key={i}
            selected={i < starsSelected}
            onClick={() => updateStarSelected(i + 1)}
            />
        ))}
        {/* <p>
            {starsSelected} of {totalStars} stars
        </p> */}
        </div>
    );
};

export default StarRating;