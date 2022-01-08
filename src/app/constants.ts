export enum ShippingPoint {
    Door = 'Door',
    TerminalOrPort = 'Terminal/Port'
}

export enum ShippingMode {
    Air = 'Air',
    Ocean = 'Ocean',
    Land = 'Land'
}

export enum ShippingVolume {
    LCL = 'LCL',
    FCL = 'FCL'
}

export enum DimensionalUnit {
    cm = 'cm',
    inch = 'inch'
}

export enum WeightUnit {
    lbs = 'lbs',
    kgs = 'kgs'
}

export enum ContainerType {
    Dry = 'Dry',
    Refrigerated = 'Refrigerated'
}

export enum ContainerSize {
    '20ft' = '20 ft.',
    '40ft' = '40 ft.',
    '40ft-high' = '40 ft. high-cube',
    '45ft' = '45 ft.',
}

export enum Prompt {
    Yes = 'Yes',
    No = 'No'
}

export enum TermsOfSale {
    ExWorks = 'Ex Works',
    FOB = 'FOB',
    CIF = 'CIF',
    CF = 'C & F',
    Other = 'other',
    DontKnow = ''
}
