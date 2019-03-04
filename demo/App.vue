<template>
  <div>
    <event-pusher></event-pusher>
    <div>Payload: {{msg}}</div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import EventPusher from "./EventPusher.vue";
import { EventAggregatorMixin } from "../src";

@Component({
  components: { EventPusher }
})
export default class App extends EventAggregatorMixin(Vue) {
  @Prop()
  msg!: string;

  created() {
    this.subscribe("TEST-EVENT", (data: any) => (this.msg = data));
  }
}
</script>
