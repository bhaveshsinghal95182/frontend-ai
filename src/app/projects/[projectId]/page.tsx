interface Props {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: Props) {
  const { projectId } = params

  return <div>Project Id: {projectId}</div>
}
