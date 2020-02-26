import * as yup from "yup";

export const scriptLoads: { [url: string]: boolean } = {};

export const loadScript = (url: string) =>
  new Promise((resolve, reject) => {
    if (scriptLoads[url]) {
      resolve();
      return;
    }

    scriptLoads[url] = false;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.async = true;
    script.onload = () => {
      scriptLoads[url] = true;
      resolve();
    };

    script.onerror = msg => {
      console.error("Error loading script.", msg);
      reject(new Error("Error loading script."));
    };

    script.onabort = msg => {
      console.warn("Script loading aboirted.", msg);
      reject(new Error("Script loading aboirted."));
    };

    document.body.appendChild(script);
  });

/**
 * Get the value for a given key in address_components
 *
 * @param {Array} components address_components returned from Google maps autocomplete
 * @param type key for desired address component
 * @returns {String} value, if found, for given type (key)
 */
export function extractFromAddress(components: google.maps.GeocoderAddressComponent[], type: string) {
  return (
    components
      .filter(component => component.types.indexOf(type) === 0)
      .map(item => item.long_name)
      .pop() || null
  );
}

export const orderArrayByChildKey = (arr: { [k: string]: any }[], key: string, order: "asc" | "desc") => {
  return order === "asc" ? arr.sort((a, b) => (a[key] < b[key] ? -1 : 1)) : arr.sort((a, b) => (a[key] < b[key] ? 1 : -1));
};

export const orderMapByChildKey = (obj: { [k: string]: { [k: string]: any } }, key: string, order: "asc" | "desc" = "asc") => {
  return orderArrayByChildKey(
    Object.entries(obj).map(([key, val]) => ({ ...val, key })),
    key,
    order
  );
};

type TAddressComponentTypes = "street_number" | "route" | "country" | "postal_code" | "postal_town";
export const humaneAddress = (addrCmpnts: google.maps.GeocoderAddressComponent[]) => {
  return ["street_number", "route", "country", "postal_code", "postal_town"].reduce((accum, addressKey) => {
    const val = extractFromAddress(addrCmpnts, addressKey);
    return val ? { ...accum, [addressKey]: val } : accum;
  }, {} as { [key in TAddressComponentTypes]: string });
};

export const humaneToFormattedAddress = (address: Partial<ReturnType<typeof humaneAddress>>) => {
  return (["street_number", "route", "country", "postal_town", "postal_code"] as TAddressComponentTypes[])
    .reduce((accum, addressKey) => {
      const val = address[addressKey];
      return val ? [...accum, val] : accum;
    }, [] as string[])
    .join(", ");
};

export const dateAndTimeValidation = {
  date: yup
    .date()
    .required()
    .transform(function(value, originalValue) {
      if (this.isType(value)) return value;
      const invalidDate = new Date("");
      // the default coercion transform failed so let's try it with Moment instead
      value = new Date(originalValue);
      return !isNaN(value) ? value : invalidDate;
    }),
  serviceHasTime: yup.boolean(),
  time: yup.string().when("serviceHasTime", {
    is: true,
    then: yup.string().required(),
    otherwise: yup
      .string()
      .nullable()
      .notRequired(),
  }),
};
