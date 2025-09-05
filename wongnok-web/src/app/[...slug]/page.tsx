type SlugProps = {
  params: Promise<{
    slug: string
  }>
}

const RecipeDetailsId = async ({ params }: SlugProps) => {
  const { slug } = await params
  return <div>this is slug file {slug}</div>
}

export default RecipeDetailsId
