import { useState } from "react";

export default function ImageWithFallBack({
  src,
  alt,
  className,
  fallback = "/default-class.png",
  placeholder = "🏋️",
}) {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  // If it's the fallback and we already errored, show placeholder emoji
  if (hasError && imgSrc === fallback) {
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center text-6xl`}
      >
        {placeholder}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
