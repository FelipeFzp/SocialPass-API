import { PaginationFilter } from "../abstraction/pagination.filter";
import { SearchFilter } from "../abstraction/search.filter";

export interface UserFilter extends PaginationFilter, SearchFilter { }