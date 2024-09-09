export class CreateKbEmbeddingDto {
  bucket: string;
  embeddingApiKey: string;
}

export class CreateKbEmbeddingResp {
  ok: boolean;
}

export type PartitionElement = {
  type: 'CompositeElement';
  element_id: string; // e.g. "f5756284cf6c93fcf291ff915d5fe28f",
  text: string;
  metadata: {
    filetype: string; // e.g "application/pdf",
    languages: string[]; // e.g. ["eng"],
    page_number: number;
    orig_elements: string; // e.g. "eJy1V1tv2zYU/iuCnkOB90vf2kBtAmyJkWjdiqAISOnQEabYhi13NYr995GSjCWxUdSG9GSdzzyi+H3nxocfKTTwDIv2sa7Sd0nKHCFUYoMEpx5x4gUyUinESmtLyrmqDKQXSfoMra1sa4PPj7RcLtdVvbAtbDq7sbvltn18gnr+1AaEUoyDzwD/U1ftU0CJ6tDVsl600e/hQUqdiYuEMZ3xrxfJ3uZYZSLaBDNyFOg9ApJudpsWnuNJZvV3aO5XtoT03/BHBS2Ubb1cPJaN3WweV+ulC8twxjFlOizwdQPtbgWd7+z3tPvgxXxr592pHlJYzNO4xSogj4vts4N1PEV8eQvf4znTy9ubIr8p7qPz/l1F3TbdJ7yl2mpXEmAcWW4V4hRzpEvhkDcehHelqhifjGpiWBZOLTgfmBxsPdiciQwfsbv15xHNwgn5SEQX18VveTJ7/yn/JaoZcRwzUyHqJCDupUVOYIWw5dIrDlgYOhnVYVmkTgrdU7m3jd5TqzJ1xO7W/5TqcUJ29uXu+tNV8UtEKuClM8YjiyVH3FYeOWIpqgB78KqkpTUTxizO6EWiFMtMH7OdrakZbEJYZO4A6D3OjFqmRova2Rp82PBdUqxtt1l42D6vNkn+Dda79qkOr3ihwo1dr21bf4Mi+h8La2qCIJShEMQyFGsHyAIPpvRccIOFlmJCNbrSqxXOSK9GZxslevKlZBk5tPv152khMKdyrLi/ej8r8rvk9ib/X47LJ7tYQLM5SQUlAjfhWEgaa4IKRCHnPUHUV7qUJcNg8XQqaJOxi4RgogcZBoDQIUskMzFLDoHe5cymSQ1TIytR/Hn7IjFCMvx9cj4Ihz0rJSK4cohLzZBxBiOqmdGccOdpOXWZJ0TyV3U+jFNDORKBeH0M6F3OzAkWitzYSlzd5XnyYds0G9jBSRJIYF4T7pGhOpQkI2hoFcYhDFJWlXLUkek6bYz9GNmM4GGqGQBOhiIkTHg4BvQu50qA9dhl6ePtH3cvsgE27anJYCrqhRZhyHFhqOSCAXLY6tCqDS896NI4NqkSMvIseKb2SkRAyKEKCSy72D8Aepczy5LSoyfDx+vPeXK5rtu6tE0ys+HEJ3UHTYWM3YGDDxcqRsO87yqDAmfGKgyCmAknJq27EiQx7W9UeyBsvo9/2ulyAPQuZ8oglSAjy3B//VdS2PUcYiIkH5rl/LQuzUllFPUaeXAacWUkskp45AnXTgrhlVeT9wYl6OveEPLzdSs4AHqXM2fXMACOXZju88/5TTLbuqYu63Z3kgaALdbxukA8CRoQqZEGEe4RLsxQoVMrD2TCeVVkPDIcf/uBtQcMGy5egupudDoAepdz7w9Gjp0L+dv72hvmv/4H6Q42lg==",
    filename: string;
  };
};
