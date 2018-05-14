const THRESHOLD = 30;
const DEFAULT_DURATION = 300;
const $view = document.getElementById("carousel");
const $container = $view.querySelector(".container");
const PANEL_COUNT = $container.querySelectorAll(".panel").length;
const SUPPORT_TOUCH = "ontouchstart" in window;
const EVENTS = {
  start: SUPPORT_TOUCH ? "touchstart" : "mousedown",
  move: SUPPORT_TOUCH ? "touchmove" : "mousemove",
  end: SUPPORT_TOUCH ? "touchend" : "mouseup",
};

const {
  fromEvent,
  merge,
  operators: {
    map,
    startWith,
    switchMap,
    takeUntil,
    tap,
    share,
    first,
    withLatestFrom,
    scan,
  },
} = rxjs;

const toPos = obs$ =>
  obs$.pipe(map(v => (SUPPORT_TOUCH ? v.changedTouches[0].pageX : v.pageX)));

const translateX = posX => {
  $container.style.transform = `translate3d(${posX}px, 0, 0)`;
};

const start$ = fromEvent($view, EVENTS.start).pipe(toPos);
const move$ = fromEvent($view, EVENTS.move).pipe(toPos);
const end$ = fromEvent($view, EVENTS.end);

const size$ = fromEvent(window, "resize").pipe(
  startWith(0),
  map(event => $view.clientWidth),
);

// size$.subscribe(width => console.log("view의 넓이", width));

const drag$ = start$.pipe(
  switchMap(start =>
    move$.pipe(
      map(move => move - start), // move diff
      takeUntil(end$),
    ),
  ),
  // tap(v => console.log("drag$", v)),
  map(distance => ({ distance })),
  share(),
);

// drag$.subscribe(distance => console.log("start$와 move$의 차이값", distance));

const drop$ = drag$.pipe(
  // tap(v => console.log("drop$", v))
  switchMap(drag =>
    end$.pipe(
      map(event => drag), // drag는 drag$가 전달하는 start$와 move$의 위치 값의 거리
      first(),
    ),
  ),
  withLatestFrom(size$, (drag, size) => ({ ...drag, size })),
);

// drop$.subscribe(array => console.log("drop", array));

const carousel$ = merge(drag$, drop$).pipe(
  scan(
    (store, { distance, size }) => {
      const updateStore = {
        from: -(store.index * store.size) + distance,
      };

      if (size === undefined) {
        // drag 시점
        updateStore.to = updateStore.from;
      } else {
        // drop 시점
        let tobeIndex = store.index;
        if (Math.abs(distance) >= THRESHOLD) {
          tobeIndex =
            distance < 0
              ? Math.min(tobeIndex + 1, PANEL_COUNT - 1)
              : Math.max(tobeIndex - 1, 0);
        }
        updateStore.index = tobeIndex;
        updateStore.to = -(tobeIndex * size);
        updateStore.size = size;
      }

      return { ...store, ...updateStore };
    },
    { from: 0, to: 0, index: 0, size: 0 },
  ),
);

carousel$.subscribe(v => {
  console.log("캐로셀 데이터", v);
  translateX(v.to);
});
