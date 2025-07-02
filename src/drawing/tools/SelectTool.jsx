import { useContext, useEffect } from "react";
import { AnnotationContext } from "../../core/AnnotationContext.jsx";
import { Stage } from "konva";

const SelectTool = ({ stageRef }) => {
  const { annotations, setSelectedId, currentImage } = useContext(AnnotationContext);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !currentImage) return;

    const handleClick = (e) => {
      if (e.target === stage) {
        setSelectedId(null);
        return;
      }
      const clicked = annotations.find(
        (ann) => ann.id === e.target.attrs.id && ann.imageId === currentImage.id
      );
      if (clicked) {
        setSelectedId(clicked.id);
      } else {
        setSelectedId(null);
      }
    };

    stage.on("click", handleClick);

    return () => {
      stage.off("click", handleClick);
    };
  }, [annotations, setSelectedId, currentImage]);

  return null;
};

export default SelectTool;
