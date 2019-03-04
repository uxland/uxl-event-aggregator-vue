<template>
  <button @click="publishEvent">PUBLISH</button>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { EventAggregator } from "../src";

@Component
export default class EventPusher extends EventAggregator(Vue) {
  publishEvent() {
    this.publish("TEST-EVENT", "Test Event Data");
  }
}
</script>
