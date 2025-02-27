import React from "react";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
};

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = "",
  titleClassName = "",
  bodyClassName = "",
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {(title || subtitle) && (
        <div className={`px-4 py-5 sm:px-6 ${titleClassName}`}>
          {title && (
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
