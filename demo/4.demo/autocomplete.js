const {
  fromEvent,
  operators: {
    pluck,
    finalize,
    retry,
    debounceTime,
    map,
    distinctUntilChanged,
    share,
    tap,
    switchMap,
    merge,
    partition,
  },
  ajax: { ajax },
} = rxjs;

import { handleAjax } from "./common.js";

export default class AutoComplete {
  constructor($autocomplete) {
    this.$input = $autocomplete.querySelector("input");
    this.$layer = $autocomplete.querySelector(".layer");
    this.$loading = $autocomplete.querySelector(".loading");

    let [search$, reset$] = this.createKeyup$().pipe(
      partition(query => query.trim().length > 0)
    );

    search$ = search$.pipe(
      tap(() => this.showLoading()),
      switchMap(query => ajax.getJSON(`/bus/${query}`)),
      handleAjax("busRouteList"),
      retry(2),
      tap(() => this.hideLoading()),
      finalize(() => {
        this.hideLoading();
        this.$layer.style.display = "none";
      }),
      finalize(() => this.reset())
    );
    reset$ = reset$.pipe(
      merge(fromEvent(this.$layer, "click", evt => evt.target.closest("li")))
    );

    search$.subscribe(items => this.render(items));
    reset$.subscribe(() => this.reset());
  }

  createKeyup$() {
    return fromEvent(this.$input, "keyup").pipe(
      debounceTime(300),
      map(event => event.target.value),
      distinctUntilChanged(),
      share()
    );
  }

  showLoading() {
    this.$loading.style.display = "block";
  }
  hideLoading() {
    this.$loading.style.display = "none";
  }
  reset() {
    this.hideLoading();
    this.$layer.style.display = "none";
  }

  render(buses) {
    this.$layer.innerHTML = buses
      .map(bus => {
        return `
        <li>
          <a href="#">
              <strong>${bus.routeName}</strong>
              <span>${bus.regionName}</span>
              <div>${bus.routeTypeName}</div>
          </a>
        </li>`;
      })
      .join("");
    this.$layer.style.display = "block";
  }
}
