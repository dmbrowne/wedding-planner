import React from "react";
import { Box, Layer, LayerProps } from "grommet";
import AddPartner, { IProps } from "./add-partner";

const AddPartnerModal: React.FC<IProps & { modalProps?: LayerProps }> = ({ modalProps, ...props }) => {
  return (
    <Layer {...modalProps}>
      <Box pad="large" width={{ min: "650px" }} height={{ min: "400px" }}>
        <AddPartner {...props} />
      </Box>
    </Layer>
  );
};

export default AddPartnerModal;
