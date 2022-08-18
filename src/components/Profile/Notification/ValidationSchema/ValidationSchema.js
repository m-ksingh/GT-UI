import * as Yup from 'yup';

// Counter Thread Schema
export const CounterSchema = Yup.object().shape({
    counterPrice: Yup.string().matches(/^\d*\.?\d*$/, "Must be only digits")
        .required("Counter price is required")
});

export const ManageQuantitySchema = Yup.object().shape({
    quantity: Yup.string().matches(/^[+0-9]+$/,"Must be only digits"),
});

// Schedule pickup date Schema
export const ScheduleSchema = Yup.object().shape({
    slot1Date: Yup.object().shape({
        date: Yup.string().required("Date is required"),
        slot1Time: Yup.object().shape({
            from: Yup.string().required("required!"),
            to: Yup.string().required("required!")
        }),
        slot2Time: Yup.object().shape({
            from: Yup.string().required("required!"),
            to: Yup.string().required("required!")
        })
    }),
    slot2Date: Yup.object().shape({
        date: Yup.string().required("Date is required"),
        slot1Time: Yup.object().shape({
            from: Yup.string().required("required!"),
            to: Yup.string().required("required!")
        }),
        slot2Time: Yup.object().shape({
            from: Yup.string().required("required!"),
            to: Yup.string().required("required!")
        })
    }),
    slot3Date: Yup.object().shape({
        date: Yup.string().required("Date is required"),
        slot1Time: Yup.object().shape({
            from: Yup.string().required("required!"),
            to: Yup.string().required("required!")
        }),
        slot2Time: Yup.object().required('required!')
    })
});

export const ProvideShippingSchema = Yup.object().shape({
    shipmentPartnerName: Yup.string().required("Required!"),
    trackingId: Yup.string().required("Required!"),
    trackingUrl: Yup.string()
        .matches(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm, "Invalid URL")
        .required("Required!"),
    fflLocation: Yup.string().required("Required!"),
    shippedDate: Yup.string().required("Required!"),
    estimatedDeliveryDate: Yup.string().required("Required!"),
    shipmentCharges: Yup.number().typeError("Please enter a valid number").min(0, "Minimum shipping charge should be 0").required("Required!"),
});

export const SelectItemSchemaWithSerial = Yup.object().shape({
    currentQuantity: Yup.string().required("Required!"),
    serialNumbers: Yup.array().of(
        Yup.object().shape({
            serialNumber: Yup.string().required("Required!")
        })
    )
});

export const SelectItemSchemaWithoutSerial = Yup.object().shape({
    currentQuantity: Yup.string().required("Required!"),
});

export const RenewStoreLicenseSchema = Yup.object().shape({
    licenseExpiresOn: Yup.string().required("Expire date is required"),
});