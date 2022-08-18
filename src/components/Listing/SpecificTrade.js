const SpecificTrade = ({ selectedSpecificListing, setListingModel }) => {
    return (
        <div className="myWishlistbox">
            <div className="row">
                <div className="col-12">
                    <h4 class="pro-spc-head">Trade Specifications
                        <span class="edit-specifications" onClick={() => { setListingModel(true) }}>
                            <img src="images/icon/Icon-feather-edit.svg" alt="edit" />
                            <span>Edit</span>
                        </span>
                    </h4>
                    <table class="table table-borderless pro-dtails-table m-0">
                        <tbody>
                            <tr>
                                <td>Category :</td>
                                <td><div className="spec-label">{selectedSpecificListing?.selectedCategoryName}</div></td>
                            </tr>
                            <tr>
                                <td>Condition :</td>
                                <td><div className="spec-label">{selectedSpecificListing?.details?.condition?.name}</div></td>
                            </tr>
                            <tr>
                                <td>Manufacturer :</td>
                                <td><div className="spec-label">{selectedSpecificListing?.details?.manufacturer?.name}</div></td>
                            </tr>
                            {selectedSpecificListing?.details?.model?.name && <tr>
                                <td>Model :</td>
                                <td><div className="spec-label">{selectedSpecificListing?.details?.model?.name}</div></td>
                            </tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default SpecificTrade
