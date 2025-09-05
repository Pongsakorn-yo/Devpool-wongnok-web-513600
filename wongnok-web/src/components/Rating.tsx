// คอมโพเนนต์รูปดาว 1 ดวง (กำหนดเปอร์เซ็นต์การเติมสี)
type RatingFoodRecipe = {
  fillPercent: number
}

const Rating = ({ fillPercent }: RatingFoodRecipe) => {
  return (
    <span
      className="relative inline-block w-6 h-10 text-xl text-gray-300 overflow-hidden "
  aria-label={
        fillPercent === 100
          ? 'Filled star'
          : fillPercent === 0
          ? 'Empty star'
          : 'Partial star'
      }
    >
  {/* ดาวพื้นสีเทา */}
  <span className="absolute left-0 top-0 w-full h-full text-3xl">★</span>
      <span
        className="absolute left-0 top-0 h-full overflow-hidden pointer-events-none text-blue-600 text-3xl"
        style={{ width: `${fillPercent}%` }}
      >
        ★
      </span>
    </span>
  );
};

export default Rating
